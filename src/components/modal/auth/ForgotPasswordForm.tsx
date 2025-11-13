import React from 'react';
import { useForm } from 'react-hook-form';

interface IForgotPasswordForm {
  email: string;
}

interface IProps {
  onSubmit: (data: IForgotPasswordForm) => void;
}

export const ForgotPasswordForm: React.FC<IProps> = ({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IForgotPasswordForm>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-6 p-6">
      <div>
        <input
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
          type="email"
          placeholder="Email Address"
          className="input input-bordered w-full"
        />
        {errors.email && <span className="text-error text-sm mt-1">{errors.email.message}</span>}
      </div>
      <button type="submit" className="btn btn-primary w-full bg-reddit-orange hover:bg-reddit-orange-dark border-none">
        Send Reset Link
      </button>
    </form>
  );
};
