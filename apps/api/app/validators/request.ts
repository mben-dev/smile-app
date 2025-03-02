import vine from '@vinejs/vine'

/**
 * Validator for creating a new request
 */
export const createRequestValidator = vine.compile(
  vine.object({
    patientName: vine.string().trim().minLength(2).maxLength(100),
    patientAge: vine.number().min(0).max(120),
    patientGender: vine.enum(['male', 'female', 'other']),
    treatmentType: vine.enum(['expansion', 'extraction', 'CI 1', 'CI 2', 'CI 3']).optional(),
    notes: vine.string().trim().nullable().optional(),
    termsAccepted: vine.boolean().optional(),
  })
)

/**
 * Validator for updating a request status
 */
export const updateRequestStatusValidator = vine.compile(
  vine.object({
    status: vine.enum(['await_information', 'in_progress', 'to_validate', 'ask_change', 'done']),
  })
)

/**
 * Validator for updating a request
 */
export const updateRequestValidator = vine.compile(
  vine.object({
    patientName: vine.string().trim().minLength(2).maxLength(100).optional(),
    patientAge: vine.number().min(0).max(120).optional(),
    patientGender: vine.enum(['male', 'female', 'other']).optional(),
    treatmentType: vine.enum(['expansion', 'extraction', 'CI 1', 'CI 2', 'CI 3']).optional(),
    notes: vine.string().trim().nullable().optional(),
    termsAccepted: vine.boolean().optional(),
  })
)
