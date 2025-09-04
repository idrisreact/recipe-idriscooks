'use client';
import { useForm } from 'react-hook-form';
import { useState } from 'react';

interface ContactForm {
  name: string;
  email: string;
  message: string;
}

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: ContactForm) => {
    setSuccess(false);
    setError(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to send message');
      setSuccess(true);
      reset();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to send message');
      } else {
        setError('Failed to send message');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white text-gray-900 p-8 rounded-lg shadow-xl w-full max-w-md border"
      >
        <h1 className="text-2xl font-semibold text-gray-900 mb-2 text-center">Get in Touch</h1>
        <p className="text-gray-600 text-center mb-6">
          We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as
          possible.
        </p>
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
            Thank you for your message! We&apos;ll get back to you soon.
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        <div className="mb-5">
          <label className="block mb-2 font-medium text-gray-700">Name</label>
          <input
            type="text"
            {...register('name', { required: true })}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter your full name"
          />
          {errors.name && <span className="text-red-600 text-sm mt-1 block">Name is required</span>}
        </div>
        <div className="mb-5">
          <label className="block mb-2 font-medium text-gray-700">Email</label>
          <input
            type="email"
            {...register('email', { required: true })}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter your email address"
          />
          {errors.email && (
            <span className="text-red-600 text-sm mt-1 block">Email is required</span>
          )}
        </div>
        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700">Message</label>
          <textarea
            {...register('message', { required: true })}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
            placeholder="Tell us what's on your mind..."
          />
          {errors.message && (
            <span className="text-red-600 text-sm mt-1 block">Message is required</span>
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
              Sending...
            </div>
          ) : (
            'Send Message'
          )}
        </button>
      </form>
    </div>
  );
}
