import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Container } from "@/components/layout/container";

import { authClient } from "@/services/auth";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthErrorMessages } from "../hooks/errors-messages";
import { SocialSigninButton } from "./SocialSigninButton";
import type { OAuthProvider } from "../constants/oauth-providers";

const formSchema = z.object({
  mode: z.literal("magic-link"),
  email: z.string().email(),
});

type FormValues = z.infer<typeof formSchema>;

const LoginForm = () => {
  const { t } = useTranslation();
  const { getAuthErrorMessage } = useAuthErrorMessages();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email");
  const redirectPath = searchParams.get("redirectPath") || "/working";

  const { userInfo } = useAuth();

  useEffect(() => {
    if (userInfo && redirectPath) {
      navigate(redirectPath, { replace: true });
      return;
    }
    if (userInfo) {
      navigate("/working", { replace: true });
    }
  }, [redirectPath, userInfo]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: email ?? "",
      mode: "magic-link",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    try {
      const { error } = await authClient.signIn.magicLink({
        ...values,
        callbackURL: import.meta.env.VITE_APP_CALLBACK_URL + "/auth/magic-link",
      });

      if (error) {
        throw error;
      }
    } catch (e: any) {
      let errorCode: string | undefined;

      if (e && typeof e === "object") {
        if ("detail" in e && typeof e.detail === "string") {
          if (e.detail.includes("Email not confirmed")) {
            errorCode = "auth/email-not-confirmed";
          } else if (e.detail.includes("400:")) {
            errorCode = "400";
          }
        }
        if (!errorCode && e.response && typeof e.response === "object") {
          const resp = e.response as any;
          if (resp.data && typeof resp.data.detail === "string") {
            if (resp.data.detail.includes("Email not confirmed")) {
              errorCode = "auth/email-not-confirmed";
            }
          }
        }
        if (!errorCode && typeof e.message === "string") {
          if (e.message.includes("Email not confirmed")) {
            errorCode = "auth/email-not-confirmed";
          }
        }
        if (!errorCode && typeof e.code === "string") {
          errorCode = e.code;
        }
      }

      form.setError("root", {
        message: getAuthErrorMessage(errorCode),
      });
    }
  };

  const signinMode = form.watch("mode");

  return (
    <div>
      <h1 className="font-extrabold text-2xl md:text-3xl">
        {t("auth.login.title")}
      </h1>
      <p className="mt-1 mb-6 text-foreground/60">{t("auth.login.subtitle")}</p>

      {form.formState.isSubmitSuccessful && signinMode === "magic-link" ? (
        <Alert variant="default">
          <span className="size-6">📧</span>
          <AlertTitle>{t("auth.login.hints.linkSent.title")}</AlertTitle>
          <AlertDescription>
            {t("auth.login.hints.linkSent.message")}
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              {form.formState.isSubmitted &&
                form.formState.errors.root?.message && (
                  <Alert variant="destructive">
                    <AlertTitle>
                      <span className="inline-flex items-center justify-center w-4 h-4 mr-2">
                        ⚠️
                      </span>{" "}
                      {form.formState.errors.root.message}
                    </AlertTitle>
                  </Alert>
                )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.signup.email")}</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="email" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button
                className="w-full"
                type="submit"
                variant="secondary"
                disabled={form.formState.isSubmitting}
              >
                {t("auth.login.sendMagicLink")}
              </Button>
            </form>
          </Form>

          <div className="relative my-6 h-4">
            <hr className="relative top-2" />
            <p className="-translate-x-1/2 absolute top-0 left-1/2 mx-auto inline-block h-4 bg-card px-2 text-center font-medium text-foreground/60 text-sm leading-tight">
              {t("auth.login.continueWith")}
            </p>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-2">
            <SocialSigninButton provider={"google" as OAuthProvider} />
          </div>
        </>
      )}
    </div>
  );
};

const Login = () => {
  return (
    <Container className="mx-auto mt-20 flex w-[600px]">
      <Card>
        <CardContent className="pt-6 w-[500px]">
          <LoginForm />
        </CardContent>
      </Card>
    </Container>
  );
};

export default Login;
