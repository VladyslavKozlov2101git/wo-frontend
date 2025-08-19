import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { LogoIcon } from '../components/Icons';

const emailSchema = yup.object().shape({
  email: yup.string().email('Invalid email format').required('Email is required'),
});

const passwordSchema = yup.object().shape({
  newPassword: yup.string().min(6, 'Password must be at least 6 characters').required('New password is required'),
});

type EmailFormData = yup.InferType<typeof emailSchema>;
type PasswordFormData = yup.InferType<typeof passwordSchema>;

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const { register: registerEmail, handleSubmit: handleEmailSubmit, formState: { errors: emailErrors, isSubmitting: isEmailSubmitting } } = useForm<EmailFormData>({
    resolver: yupResolver<EmailFormData>(emailSchema),
  });

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting } } = useForm<PasswordFormData>({
    resolver: yupResolver<PasswordFormData>(passwordSchema),
  });

  const onEmailSubmit = (data: EmailFormData) => {
    return new Promise(resolve => {
      setTimeout(() => {
        setEmail(data.email);
        setStep('password');
        resolve(true);
      }, 1000);
    });
  };

  const onPasswordSubmit = (data: PasswordFormData) => {
     return new Promise(resolve => {
      setTimeout(() => {
        login({ email, avatarUrl: 'https://picsum.photos/100' });
        navigate('/dashboard');
        resolve(true);
      }, 1000);
    });
  };

  return (
    <>
      <div className="flex justify-center mb-6">
        <LogoIcon />
      </div>
      <h2 className="text-2xl font-bold text-center text-primary-black">
        {step === 'email' ? 'Reset your password' : 'Create new password'}
      </h2>
      
      {step === 'email' ? (
        <form onSubmit={handleEmailSubmit(onEmailSubmit)} className="mt-8 space-y-6">
          <p className="text-center text-gray-600">Enter your email and we'll send you a link to reset your password.</p>
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              type="email"
              {...registerEmail('email')}
              placeholder="Email address"
              className={`w-full px-4 py-3 rounded-lg border ${emailErrors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-red/50`}
            />
            {emailErrors.email && <p className="mt-2 text-sm text-red-600">{emailErrors.email.message}</p>}
          </div>
          <div>
            <button
              type="submit"
              disabled={isEmailSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-red hover:bg-primary-red/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-red disabled:opacity-50"
            >
              {isEmailSubmitting ? 'Sending...' : 'Request Password Reset'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="mt-8 space-y-6">
           <p className="text-center text-gray-600">Your new password must be different from previous used passwords.</p>
          <div>
            <label htmlFor="newPassword" className="sr-only">New Password</label>
            <input
              id="newPassword"
              type="password"
              {...registerPassword('newPassword')}
              placeholder="New Password"
              className={`w-full px-4 py-3 rounded-lg border ${passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-red/50`}
            />
            {passwordErrors.newPassword && <p className="mt-2 text-sm text-red-600">{passwordErrors.newPassword.message}</p>}
          </div>
          <div>
            <button
              type="submit"
              disabled={isPasswordSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-red hover:bg-primary-red/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-red disabled:opacity-50"
            >
              {isPasswordSubmitting ? 'Saving...' : 'Reset Password'}
            </button>
          </div>
        </form>
      )}

      <div className="text-sm text-center mt-4">
        <Link to="/sign-in" className="font-medium text-primary-red hover:text-primary-red/80">
          Back to Sign In
        </Link>
      </div>
    </>
  );
};

export default ForgotPassword;
