import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
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
import { config } from "@/config";
import { useAuthErrorMessages } from "../hooks/errors-messages";
import { OrganizationInvitationAlert } from "../organizations/components/OrganizationInvitationAlert";
import { LoginModeSwitch } from "./LoginModeSwitch";
import { SocialSigninButton } from "./SocialSigninButton";
import type { OAuthProvider } from "../constants/oauth-providers";
import { oAuthProviders } from "../constants/oauth-providers";

// Helper function to simulate the withQuery function
function withQuery(path: string, params: Record<string, string>) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) searchParams.append(key, value);
  }
  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
}

const formSchema = z.union([
  z.object({
    mode: z.literal("magic-link"),
    email: z.string().email(),
  }),
  z.object({
    mode: z.literal("password"),
    email: z.string().email(),
    password: z.string().min(1),
  }),
]);

type FormValues = z.infer<typeof formSchema>;

const LoginForm = () => {
  const { t } = useTranslation();
  const { getAuthErrorMessage } = useAuthErrorMessages();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const invitationId = searchParams.get("invitationId");
  const email = searchParams.get("email");
  const redirectPath = searchParams.get("redirectPath") || "/dashboard";

  const { signIn, userInfo } = useAuth();

  useEffect(() => {
    if (userInfo && redirectPath) {
      navigate(redirectPath, { replace: true });
      return;
    }
    if (userInfo) {
      navigate("/dashboard", { replace: true });
    }
  }, [redirectPath, userInfo]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: email ?? "",
      password: "",
      mode: config.auth.enablePasswordLogin ? "password" : "magic-link",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    try {
      if (values.mode === "password") {
        console.log("Signing in with password");
        const response = await authClient.signIn.email({
          ...values,
        });

        if (response.error) {
          throw response.error;
        }

        // If successful and we have the response data with user and session
        if (response.data) {
          // Store in AuthContext
          signIn(response.data);
          console.log("Sign in successful");

          // Navigate to dashboard
          console.log("Redirecting to:", redirectPath);
          navigate(redirectPath, { replace: true });
        }
      } else {
        const { error } = await authClient.signIn.magicLink({
          ...values,
          callbackURL: import.meta.env.VITE_APP_CALLBACK_URL + "/auth/magic-link",
        });

        if (error) {
          throw error;
        }
      }
    } catch (e) {
      form.setError("root", {
        message: getAuthErrorMessage(
          e && typeof e === "object" && "code" in e
            ? (e.code as string)
            : undefined
        ),
      });
    }
  };

  const signInWithPasskey = async () => {
    try {
      await authClient.signIn.passkey();

      navigate(redirectPath, { replace: true });
    } catch (e) {
      form.setError("root", {
        message: getAuthErrorMessage(
          e && typeof e === "object" && "code" in e
            ? (e.code as string)
            : undefined
        ),
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
          {invitationId && <OrganizationInvitationAlert className="mb-6" />}

          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              {config.auth.enableMagicLink &&
                config.auth.enablePasswordLogin && (
                  <LoginModeSwitch
                    activeMode={signinMode}
                    onChange={(mode) =>
                      form.setValue("mode", mode as typeof signinMode)
                    }
                  />
                )}

              {form.formState.isSubmitted &&
                form.formState.errors.root?.message && (
                  <Alert variant="destructive">
                    <span className="size-6">⚠️</span>
                    <AlertTitle>
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

              {config.auth.enablePasswordLogin && signinMode === "password" && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between gap-4">
                        <FormLabel>{t("auth.signup.password")}</FormLabel>

                        <Link
                          to="/auth/forgot-password"
                          className="text-foreground/60 text-xs"
                        >
                          {t("auth.login.forgotPassword")}
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            className="pr-10"
                            {...field}
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary text-xl"
                          >
                            {showPassword ? (
                              <span className="size-4">👁️‍🗨️</span>
                            ) : (
                              <span className="size-4">👁️</span>
                            )}
                          </button>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              <Button
                className="w-full"
                type="submit"
                variant="secondary"
                disabled={form.formState.isSubmitting}
              >
                {signinMode === "magic-link"
                  ? t("auth.login.sendMagicLink")
                  : t("auth.login.submit")}
              </Button>
            </form>
          </Form>

          {(config.auth.enablePasskeys ||
            (config.auth.enableSignup && config.auth.enableSocialLogin)) && (
            <>
              <div className="relative my-6 h-4">
                <hr className="relative top-2" />
                <p className="-translate-x-1/2 absolute top-0 left-1/2 mx-auto inline-block h-4 bg-card px-2 text-center font-medium text-foreground/60 text-sm leading-tight">
                  {t("auth.login.continueWith")}
                </p>
              </div>

              <div className="grid grid-cols-1 items-stretch gap-2 sm:grid-cols-2">
                {config.auth.enableSignup &&
                  config.auth.enableSocialLogin &&
                  Object.keys(oAuthProviders).map((providerId) => (
                    <SocialSigninButton
                      key={providerId}
                      provider={providerId as OAuthProvider}
                    />
                  ))}

                {config.auth.enablePasskeys && (
                  <Button
                    className="w-full sm:col-span-2"
                    onClick={() => signInWithPasskey()}
                  >
                    <span className="mr-1.5 size-4 text-primary">🔑</span>
                    {t("auth.login.loginWithPasskey")}
                  </Button>
                )}
              </div>
            </>
          )}

          {config.auth.enableSignup && (
            <div className="mt-6 text-center text-sm">
              <span className="text-foreground/60">
                {t("auth.login.dontHaveAnAccount")}{" "}
              </span>
              <Link
                to={withQuery(
                  "/auth/signup",
                  Object.fromEntries(searchParams.entries())
                )}
              >
                {t("auth.login.createAnAccount")}
                <span className="ml-1 inline size-4 align-middle">→</span>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const Login = () => {
  return (
    <Container className="mx-auto mt-20 flex w-[600px]">
      {/* <Flex className="justify-between mb-6">
        <ThemeSwitcher />
        <LanguageSwitcher />
      </Flex> */}
      <Card>
        <CardContent className="pt-6 w-[500px]">
          <LoginForm />
        </CardContent>
      </Card>
    </Container>
  );
};

export default Login;
