'use client';

import { useCallback, useEffect, useState } from "react";
import {
  FieldValues,
  SubmitHandler,
  useForm
} from "react-hook-form";

import { BsGithub } from "react-icons/bs";

import Input from "@/components/input/Input";
import Button from "@/components/button/Button";

import AuthSocialButton from "./AuthSocialButton";
import axios from "axios";
import { toast } from "react-hot-toast";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Variant = 'LOGIN' | 'REGISTER';

const AuthForm = () => {
  const session = useSession();
  const router = useRouter();
  const [variant, setVariant] = useState<Variant>('LOGIN');
  const [isLoading, setIsLoading] = useState(false);

  const toggleVariant = useCallback(() => {
    if (variant === 'LOGIN') {
      setVariant('REGISTER');
    } else {
      setVariant('LOGIN');
    }
  }, [variant]);

  const {
    register,
    handleSubmit,
    formState: {
      errors
    }
  } = useForm<FieldValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    }
  });

  // 表单提交事件
  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);
    
    if (variant === 'REGISTER') {
      axios.post('/api/register', data)
      .then(() => {
        signIn('credentials', {
          ...data,
          redirect: false
        });
        toast.success('注册成功');
      })
      .catch(() => {
        toast.error('无法注册，请重试');
      })
      .finally(() => {
        setIsLoading(false);
      })
    }

    if (variant === 'LOGIN') {
      signIn('credentials', {
        ...data,
        redirect: false
      }).then((response) => {
        if (response?.error) {
          toast.error("Invalid credentials");
        }

        if (response?.ok && !response?.error) {
          toast.success("Logged in");
          router.push('/users');
        }
      }).finally(() => {
        setIsLoading(false);
      })
    }
  }

  const socialAction = (action: string) => {
    setIsLoading(true);

    signIn(action, {
      redirect: false,
    }).then((response) => {
      if (response?.error) {
        toast.error("Invalid credentials");
      }

      if (response?.ok && !response?.error) {
        toast.success("Logged in");
      }
    }).finally(() => {
      setIsLoading(false);
    })
  }

  useEffect(() => {
    if (session?.status === 'authenticated') {
      router.push('/users');
    }
  }, [session?.status]);

  return (
    <div
      className="
        mt-8
        sm:mx-auto
        sm:w-full
        sm:max-w-md
      "
    >
      <div
        className="
          bg-white
          px-4
          py-8
          shadow
          sm:rounded-lg
          sm:px-10
        "
      >
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {variant === "REGISTER" && (
            <Input
              id="name"
              label="Name"
              register={register}
              errors={errors}
              disabled={isLoading}
            />
          )}
          <Input
            id="email"
            label="Email"
            type="email"
            register={register}
            errors={errors}
            disabled={isLoading}
            isAutoComplete
          />
          <Input
            id="password"
            label="Password"
            type="password"
            register={register}
            errors={errors}
            disabled={isLoading}
          />
          <div>
            <Button
              disabled={isLoading}
              fullWidth
              type="submit"
            >
              {variant === "LOGIN" ? "Sign in" : "Register"}
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div
              className="
                absolute
                inset-0
                flex
                items-center
              "
            >
              <div
                className="
                  w-full
                  border-t
                border-gray-300
                "
               />
            </div>
            <div className="
                relative
                flex
                justify-center
                text-sm
              ">
              <span className="bg-white px-2 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <AuthSocialButton
              icon={BsGithub}
              onClick={() => socialAction('github')}
            />
            {/* <AuthSocialButton
              icon={BsGoogle}
              onClick={() => socialAction('google')}
            /> */}
          </div>

          <div className="
            flex
            gap-2
            justify-center
            text-sm
            mt-6
            px-2
            text-gray-500
          ">
            <div>
              {
                variant === 'LOGIN' ? 'New to Liao ?' : 'Already have an account?'
              }
            </div>
            <div
              onClick={toggleVariant}
              className="
                underline
                cursor-pointer
              "
            >
              {
                variant === 'LOGIN' ? 'Create an account' : 'Login'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthForm;


