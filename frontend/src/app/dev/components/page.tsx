'use client';
import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import Modal from '@/components/ui/Modal';
import { toast } from '@/stores/toastStore';
import { Mascot } from '@/components/ui/Mascot';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';

export default function ComponentCatalogPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#131F24] flex transition-colors duration-200">
      <Sidebar />

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <TopNav />

        <main className="max-w-4xl mx-auto w-full p-6 md:p-10 flex flex-col gap-10">
          <div>
            <h1 className="text-3xl font-black text-duo-charcoal dark:text-white tracking-tight">
              Design System & Component Catalog
            </h1>
            <p className="text-sm font-bold text-duo-muted dark:text-gray-400 mt-1">
              Visual showcase of reusable Duolingo-styled UI primitives.
            </p>
          </div>

          {/* Mascot Showcases */}
          <section className="bg-white dark:bg-[#18272F] p-8 rounded-3xl border-2 border-duo-border dark:border-gray-700 shadow-sm flex flex-col gap-6">
            <h2 className="text-xl font-black text-duo-charcoal dark:text-white">Mascot Owl (3 Moods)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center text-center">
              <div className="flex flex-col items-center p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40">
                <Mascot mood="happy" size={110} />
                <span className="font-black text-sm text-duo-charcoal dark:text-white mt-2">Happy (Default)</span>
                <span className="text-xs font-bold text-duo-muted dark:text-gray-400">Path checkpoints & guides</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40">
                <Mascot mood="sad" size={110} />
                <span className="font-black text-sm text-duo-charcoal dark:text-white mt-2">Sad</span>
                <span className="text-xs font-bold text-duo-muted dark:text-gray-400">Out of hearts & locked skills</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40">
                <Mascot mood="celebrating" size={110} />
                <span className="font-black text-sm text-duo-charcoal dark:text-white mt-2">Celebrating</span>
                <span className="text-xs font-bold text-duo-muted dark:text-gray-400">Lesson complete & milestones</span>
              </div>
            </div>
          </section>

          {/* Buttons Showcase */}
          <section className="bg-white dark:bg-[#18272F] p-8 rounded-3xl border-2 border-duo-border dark:border-gray-700 shadow-sm flex flex-col gap-6">
            <h2 className="text-xl font-black text-duo-charcoal dark:text-white">3D Chunky Buttons</h2>
            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="primary">Primary Green</Button>
              <Button variant="blue">Secondary Blue</Button>
              <Button variant="danger">Danger Red</Button>
              <Button variant="gold">Gold Super</Button>
              <Button variant="secondary">White Outline</Button>
              <Button variant="locked" disabled>Locked Button</Button>
            </div>
            <div className="flex flex-wrap gap-4 items-center pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button size="sm" variant="primary">Small</Button>
              <Button size="md" variant="primary">Medium</Button>
              <Button size="lg" variant="primary">Large Full</Button>
            </div>
          </section>

          {/* Progress Bars */}
          <section className="bg-white dark:bg-[#18272F] p-8 rounded-3xl border-2 border-duo-border dark:border-gray-700 shadow-sm flex flex-col gap-6">
            <h2 className="text-xl font-black text-duo-charcoal dark:text-white">Glossy Progress Bars</h2>
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-xs font-black uppercase text-duo-muted dark:text-gray-400">Small (30%)</span>
                <ProgressBar value={30} size="sm" className="mt-1" />
              </div>
              <div>
                <span className="text-xs font-black uppercase text-duo-muted dark:text-gray-400">Medium (65%)</span>
                <ProgressBar value={65} size="md" className="mt-1" />
              </div>
              <div>
                <span className="text-xs font-black uppercase text-duo-muted dark:text-gray-400">Large (90%)</span>
                <ProgressBar value={90} size="lg" className="mt-1" />
              </div>
            </div>
          </section>

          {/* Cards */}
          <section className="bg-white dark:bg-[#18272F] p-8 rounded-3xl border-2 border-duo-border dark:border-gray-700 shadow-sm flex flex-col gap-6">
            <h2 className="text-xl font-black text-duo-charcoal dark:text-white">Cards & States</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <h4 className="font-black text-base text-duo-charcoal dark:text-white">Standard Card</h4>
                <p className="text-xs text-duo-muted dark:text-gray-400 mt-1 font-bold">Neutral state with soft border.</p>
              </Card>
              <Card selected>
                <h4 className="font-black text-base text-duo-blue">Selected Card</h4>
                <p className="text-xs text-duo-blue/80 mt-1 font-bold">Active option selection border.</p>
              </Card>
              <Card highlighted>
                <h4 className="font-black text-base text-duo-greenDark dark:text-green-400">Highlighted Card</h4>
                <p className="text-xs text-duo-greenDark/80 dark:text-green-300 mt-1 font-bold">Unit banner / achievement accent.</p>
              </Card>
            </div>
          </section>

          {/* Modals & Toasts */}
          <section className="bg-white dark:bg-[#18272F] p-8 rounded-3xl border-2 border-duo-border dark:border-gray-700 shadow-sm flex flex-col gap-6">
            <h2 className="text-xl font-black text-duo-charcoal dark:text-white">Modals & Notifications</h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="blue" onClick={() => setModalOpen(true)}>
                Open Demo Modal
              </Button>
              <Button
                variant="gold"
                onClick={() => toast.streak('🔥 Streak Extended! 3 Day Streak!')}
              >
                Trigger Streak Toast
              </Button>
              <Button
                variant="primary"
                onClick={() => toast.achievement('🏆 Achievement Unlocked: First Lesson!')}
              >
                Trigger Badge Toast
              </Button>
              <Button
                variant="secondary"
                onClick={() => toast.success('❤️ Hearts Refilled to 5/5!')}
              >
                Trigger Heart Refill Toast
              </Button>
            </div>
          </section>
        </main>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Demo Modal">
        <p className="text-sm font-bold text-duo-muted dark:text-gray-400">
          This is a reusable Duolingo-styled modal dialog with accessible Escape key support and smooth backdrop blur.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Dismiss
          </Button>
          <Button variant="primary" onClick={() => setModalOpen(false)}>
            Understood
          </Button>
        </div>
      </Modal>
    </div>
  );
}
