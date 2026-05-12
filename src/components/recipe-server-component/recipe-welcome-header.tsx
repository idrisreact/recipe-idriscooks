'use client';

import { memo } from 'react';
import { Session } from '@/src/types';
import { motion } from 'framer-motion';

interface RecipeWelcomeHeaderProps {
  session: Session | null;
  onSignIn: () => void;
}

export const RecipeWelcomeHeader = memo(function RecipeWelcomeHeader({
  session,
  onSignIn,
}: RecipeWelcomeHeaderProps) {
  if (session) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <span className="eyebrow mb-2 block">Welcome back</span>
        <h2 className="display-s">{session.user.name}</h2>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12 border-t border-[var(--ink)] bg-[var(--parchment)] p-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <span className="eyebrow mb-2 block">Guest</span>
          <h2 className="subhead mb-2">Welcome to Idris Cooks</h2>
          <p className="body-md">Sign in to access all recipes and save your favorites.</p>
        </div>
        <button
          type="button"
          aria-label="Sign in with Google"
          onClick={onSignIn}
          className="btn-primary whitespace-nowrap"
        >
          Sign In
        </button>
      </div>
    </motion.div>
  );
});
