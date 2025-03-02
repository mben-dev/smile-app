import Request from '#models/request'
import RequestFile from '#models/request_file'
import {
  createRequestValidator,
  updateRequestStatusValidator,
  updateRequestValidator,
} from '#validators/request'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import drive from '@adonisjs/drive/services/main'
import vine from '@vinejs/vine'

export default class RequestsController {
  /**
   * Display a list of requests for the authenticated user
   */
  async index({ auth, request, response }: HttpContext) {
    const user = auth.user!

    // Récupérer les paramètres de filtrage et de tri
    const { patientName, status, userId, sortBy = 'createdAt', sortOrder = 'desc' } = request.qs()

    // Admin can see all requests, regular users can only see their own
    let query = Request.query()

    // Filtrage par utilisateur (admin uniquement)
    if (user.isAdmin) {
      if (userId) {
        query = query.where('userId', userId)
      }
    } else {
      // Les utilisateurs normaux ne peuvent voir que leurs propres demandes
      query = query.where('userId', user.id)
    }

    // Filtrage par nom de patient
    if (patientName) {
      query = query.whereILike('patientName', `%${patientName}%`)
    }

    // Filtrage par statut
    if (status) {
      query = query.where('status', status)
    }

    // Tri
    const allowedSortFields = ['createdAt', 'patientName', 'status', 'patientAge']
    const finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt'
    const finalSortOrder = sortOrder === 'asc' ? 'asc' : 'desc'

    query = query.orderBy(finalSortBy, finalSortOrder)

    // Exécuter la requête
    let requests

    if (user.isAdmin) {
      // Pour les admins, charger les données de l'utilisateur avec chaque demande
      requests = await query.preload('user', (userQuery) => {
        userQuery.select('id', 'fullName', 'email')
      })

      // Transformer les résultats pour inclure les informations de l'utilisateur directement
      requests = requests.map((req) => {
        const requestJson = req.toJSON()
        return {
          ...requestJson,
          userName: req.user ? req.user.fullName : 'Utilisateur inconnu',
          userEmail: req.user ? req.user.email : '',
        }
      })
    } else {
      // Pour les utilisateurs normaux, juste leurs propres demandes
      requests = await query
    }

    return response.ok(requests)
  }

  /**
   * Display a single request
   */
  async show({ params, auth, response }: HttpContext) {
    const user = auth.user!
    let request = await Request.find(params.id)

    if (!request) {
      return response.notFound({ message: 'Request not found' })
    }

    // Check if the user is authorized to view this request
    if (!user.isAdmin && request.userId !== user.id) {
      return response.forbidden({ message: 'You are not authorized to view this request' })
    }

    // Load files associated with the request
    await request.load('files')

    // Si l'utilisateur est admin, charger les informations de l'utilisateur
    if (user.isAdmin) {
      await request.load('user', (query) => {
        query.select('id', 'fullName', 'email')
      })

      // Transformer le résultat pour inclure les informations de l'utilisateur directement
      const requestJson = request.toJSON()
      return response.ok({
        ...requestJson,
        userName: request.user ? request.user.fullName : 'Utilisateur inconnu',
        userEmail: request.user ? request.user.email : '',
      })
    }

    return response.ok(request)
  }

  /**
   * Create a new request
   */
  async store({ request, auth, response }: HttpContext) {
    const user = auth.user!
    const payload = await request.validateUsing(createRequestValidator)

    // Create the request with initial status 'await_information'
    const newRequest = await Request.create({
      ...payload,
      userId: user.id,
      status: 'await_information',
    })

    return response.created(newRequest)
  }

  /**
   * Update a request
   */
  async update({ params, request, auth, response }: HttpContext) {
    const user = auth.user!
    const req = await Request.find(params.id)

    if (!req) {
      return response.notFound({ message: 'Request not found' })
    }

    // Check if the user is authorized to update this request
    if (!user.isAdmin && req.userId !== user.id) {
      return response.forbidden({ message: 'You are not authorized to update this request' })
    }

    // Only allow updates if the request is in certain statuses
    if (req.status !== 'await_information' && req.status !== 'ask_change' && !user.isAdmin) {
      return response.forbidden({
        message: 'This request cannot be updated in its current status',
      })
    }

    const payload = await request.validateUsing(updateRequestValidator)
    req.merge(payload)
    await req.save()

    return response.ok(req)
  }

  /**
   * Update the status of a request (admin only)
   */
  async updateStatus({ params, request, auth, response }: HttpContext) {
    const user = auth.user!

    // Only admins can update status
    if (!user.isAdmin) {
      return response.forbidden({ message: 'Only admins can update request status' })
    }

    const req = await Request.find(params.id)

    if (!req) {
      return response.notFound({ message: 'Request not found' })
    }

    const { status } = await request.validateUsing(updateRequestStatusValidator)
    req.status = status
    await req.save()

    return response.ok(req)
  }

  /**
   * Upload files for a request
   */
  async uploadFiles({ params, request, auth, response }: HttpContext) {
    try {
      const user = auth.user!
      const requestId = params.id
      const requestRecord = await Request.query().where('id', requestId).first()

      if (!requestRecord) {
        return response.notFound({ message: 'Request not found' })
      }

      // Vérifier que l'utilisateur est le propriétaire de la demande ou un admin
      if (requestRecord.userId !== user.id && !user.isAdmin) {
        return response.forbidden({
          message: 'You are not authorized to upload files to this request',
        })
      }

      // Traiter les fichiers téléchargés
      const files = request.allFiles()

      if (Object.keys(files).length === 0) {
        return response.badRequest({ message: 'No files uploaded' })
      }

      // Traiter chaque fichier
      for (const [key, file] of Object.entries(files)) {
        // S'assurer que file est un MultipartFile et non un tableau
        if (Array.isArray(file)) continue

        // Extraire le type de fichier (radiography, photos, scan) et l'index du nom de la clé
        const [fileType] = key.split('_')

        // Vérifier que le type de fichier est valide
        if (!['radiography', 'photos', 'scan'].includes(fileType)) {
          continue
        }

        // Générer un nom de fichier unique
        const fileName = `${fileType}_${Date.now()}_${file.clientName}`

        // Spécifier le chemin complet pour le stockage
        const storagePath = `requests/${requestId}/${fileName}`

        // Déplacer le fichier vers le stockage
        await file.moveToDisk(storagePath)

        // Obtenir l'URL du fichier téléchargé
        const url = await drive.use().getUrl(storagePath)

        // Créer un enregistrement pour le fichier dans la base de données
        await RequestFile.create({
          requestId,
          fileName: file.clientName,
          filePath: storagePath,
          fileType: fileType as 'radiography' | 'photos' | 'scan',
          fileSize: file.size,
          mimeType: file.type || 'application/octet-stream',
          url: url,
        })
      }

      // Mettre à jour le statut de la demande si nécessaire
      if (requestRecord.status === 'await_information') {
        await requestRecord.merge({ status: 'in_progress' }).save()
      }

      return response.ok({ message: 'Files uploaded successfully' })
    } catch (error) {
      console.error('Error uploading files:', error)
      return response.internalServerError({ message: 'Error uploading files', error })
    }
  }

  /**
   * Upload final STL file (admin only)
   */
  async uploadFinalStl({ params, request, auth, response }: HttpContext) {
    const user = auth.user!

    // Only admins can upload final STL files
    if (!user.isAdmin) {
      return response.forbidden({ message: 'Only admins can upload final STL files' })
    }

    const req = await Request.find(params.id)

    if (!req) {
      return response.notFound({ message: 'Request not found' })
    }

    // Get the STL file from the request
    const stlFile = request.file('stl')

    if (!stlFile) {
      return response.badRequest({ message: 'No STL file provided' })
    }

    // Check file extension
    const allowedExtnames = ['stl', 'zip']

    // Extraire l'extension du nom de fichier client si extname n'est pas défini
    let fileExtension = stlFile.extname

    if (!fileExtension && stlFile.clientName) {
      const parts = stlFile.clientName.split('.')
      if (parts.length > 1) {
        fileExtension = parts[parts.length - 1].toLowerCase()
      }
    }

    console.log('File extension:', fileExtension, 'Client name:', stlFile.clientName)

    if (!fileExtension || !allowedExtnames.includes(fileExtension)) {
      return response.badRequest({
        message: `Invalid file extension. Allowed: ${allowedExtnames.join(', ')}`,
      })
    }

    // Generate a unique filename
    const fileName = `${req.id}/final/${cuid()}.${fileExtension}`

    // Move the file to the storage
    await stlFile.moveToDisk(fileName)

    // Get the URL of the uploaded file
    const url = await drive.use().getUrl(fileName)

    // Save file information to the database
    const requestFile = await RequestFile.create({
      requestId: req.id,
      fileName: stlFile.clientName,
      filePath: fileName,
      fileType: 'final',
      fileSize: stlFile.size,
      mimeType: stlFile.type || `application/${fileExtension}`,
      url: url,
    })

    // Update the request status to 'to_validate'
    req.status = 'to_validate'
    await req.save()

    return response.ok({
      message: 'Final STL file uploaded successfully',
      file: requestFile,
      request: req,
    })
  }

  /**
   * Submit feedback or request changes
   */
  async submitFeedback({ params, request, auth, response }: HttpContext) {
    const user = auth.user!
    const req = await Request.find(params.id)

    if (!req) {
      return response.notFound({ message: 'Request not found' })
    }

    // Check if the user is authorized to submit feedback for this request
    if (!user.isAdmin && req.userId !== user.id) {
      return response.forbidden({
        message: 'You are not authorized to submit feedback for this request',
      })
    }

    // Only allow feedback if the request is in 'to_validate' status
    if (req.status !== 'to_validate') {
      return response.forbidden({
        message: 'Feedback can only be submitted when the request is in validation status',
      })
    }

    // Validate the feedback
    const feedbackValidator = vine.compile(
      vine.object({
        feedback: vine.string().trim().minLength(5),
        approved: vine.boolean(),
      })
    )

    const { feedback, approved } = await request.validateUsing(feedbackValidator)

    // Update the request notes and status based on approval
    req.notes = feedback

    if (approved) {
      // If approved, mark as done
      req.status = 'done'
    } else {
      // If not approved, request changes
      req.status = 'ask_change'
    }

    await req.save()

    return response.ok({
      message: approved ? 'STL approved' : 'Changes requested',
      request: req,
    })
  }

  /**
   * Download STL files for a request (only when status is 'done')
   */
  async downloadStl({ params, auth, response }: HttpContext) {
    const user = auth.user!
    const req = await Request.find(params.id)

    if (!req) {
      return response.notFound({ message: 'Request not found' })
    }

    // Check if the user is authorized to download STL for this request
    if (!user.isAdmin && req.userId !== user.id) {
      return response.forbidden({
        message: 'You are not authorized to download STL for this request',
      })
    }

    // Only allow downloads if the request is in 'done' status
    if (req.status !== 'done' && !user.isAdmin) {
      return response.forbidden({
        message: 'STL files can only be downloaded when the request is completed',
      })
    }

    // Find the final STL file
    const stlFile = await RequestFile.query()
      .where('requestId', req.id)
      .where('fileType', 'final')
      .orderBy('createdAt', 'desc')
      .first()

    if (!stlFile) {
      return response.notFound({
        message: 'STL file not found for this request',
      })
    }

    try {
      const signedUrl = await drive.use().getSignedUrl(stlFile.filePath, {
        expiresIn: '1h', // URL expires in 1 hour
      })

      return response.ok({
        message: 'STL file ready for download',
        url: signedUrl,
        file: stlFile,
      })
    } catch (error) {
      return response.notFound({
        message: 'STL file not found',
        error: error.message,
      })
    }
  }
}
