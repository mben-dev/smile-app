"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "app/providers/auth-provider";
import { Button } from "components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "components/ui/form";
import { Input } from "components/ui/input";
import api from "lib/api";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const profileSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  email: z.string().email({ message: "Email invalide" }),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
    newPassword: z
      .string()
      .min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export default function ProfilePage() {
  const { authState, checkAuth } = useAuth();
  const { user } = authState;
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      email: "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        fullName: user.fullName!,
        email: user.email,
      });
    }
  }, [user, profileForm]);

  const onSubmitProfile = async (values: z.infer<typeof profileSchema>) => {
    setIsSubmittingProfile(true);
    try {
      await api.put(`/profile`, values);
      await checkAuth();
      toast.success("Profil mis à jour", {
        description: "Vos informations ont été mises à jour avec succès",
      });
    } catch (error: any) {
      toast.error("Erreur", {
        description: error.response?.data?.message || "Une erreur est survenue",
      });
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const onSubmitPassword = async (values: z.infer<typeof passwordSchema>) => {
    setIsSubmittingPassword(true);
    try {
      await api.put(`/profile/password`, {
        currentPassword: values.currentPassword,
        password: values.newPassword,
      });
      passwordForm.reset();
      toast.success("Mot de passe mis à jour", {
        description: "Votre mot de passe a été modifié avec succès",
      });
    } catch (error: any) {
      toast.error("Erreur", {
        description: error.response?.data?.message || "Une erreur est survenue",
      });
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        Chargement...
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Mon profil</CardTitle>
          <CardDescription>
            Modifiez vos informations personnelles
          </CardDescription>
        </CardHeader>
        <Form {...profileForm}>
          <form onSubmit={profileForm.handleSubmit(onSubmitProfile)}>
            <CardContent className="space-y-4">
              <FormField
                control={profileForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmittingProfile}>
                {isSubmittingProfile
                  ? "Enregistrement..."
                  : "Enregistrer les modifications"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Changer de mot de passe</CardTitle>
          <CardDescription>
            Modifiez votre mot de passe de connexion
          </CardDescription>
        </CardHeader>
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)}>
            <CardContent className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe actuel</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nouveau mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmer le mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmittingPassword}>
                {isSubmittingPassword
                  ? "Modification..."
                  : "Modifier le mot de passe"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
