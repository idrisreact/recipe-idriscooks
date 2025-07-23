"use client";
import { useForm } from "react-hook-form";
import { useState } from "react";

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
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok)
        throw new Error((await res.json()).error || "Failed to send message");
      setSuccess(true);
      reset();
    } catch (err: any) {
      setError(err.message || "Failed to send message");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Contact Us</h1>
        {success && (
          <div className="mb-4 text-green-600">
            Thank you for your message! We'll get back to you soon.
          </div>
        )}
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Name</label>
          <input
            type="text"
            {...register("name", { required: true })}
            className="w-full border rounded px-3 py-2"
          />
          {errors.name && (
            <span className="text-red-500 text-sm">Name is required</span>
          )}
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            {...register("email", { required: true })}
            className="w-full border rounded px-3 py-2"
          />
          {errors.email && (
            <span className="text-red-500 text-sm">Email is required</span>
          )}
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-medium">Message</label>
          <textarea
            {...register("message", { required: true })}
            className="w-full border rounded px-3 py-2 min-h-[100px]"
          />
          {errors.message && (
            <span className="text-red-500 text-sm">Message is required</span>
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}
