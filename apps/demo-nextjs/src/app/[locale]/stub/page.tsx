'use client';
import React, { useState } from 'react';
import {
  Brain,
  Lightbulb,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  ArrowRight,
  Clock,
  Sparkles,
  Notebook,
  LayoutGrid,
  Split,
} from 'lucide-react';

function App() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <nav className="mb-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <img src="/qiz-favicon-128x128.png" className="h-12 w-12" alt="Qiz logo" />
            КВИЗ
          </div>
          <div className="flex items-center gap-2 rounded-full bg-purple-500/20 px-4 py-2">
            <Clock className="h-5 w-5 text-purple-400" />
            <span className="text-purple-200">Скоро запуск</span>
          </div>
        </nav>

        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-5xl font-bold text-transparent md:text-6xl">
            Ваше рабочее пространство. Переосмыслено.
          </h1>
          <p className="mb-12 text-xl text-gray-300">
            КВИЗ объединяет контент, визуализацию, идеи и заметки в единое интуитивное пространство для творчества и продуктивности
          </p>

          <div className="mb-12 flex items-center justify-center gap-3">
            <Sparkles className="h-5 w-5 text-yellow-400" />
            <span className="text-yellow-200">Запуск в 2025 году</span>
          </div>

          <div className="mx-auto max-w-md">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введите ваш email"
                className="rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-medium transition-all hover:from-blue-600 hover:to-purple-700"
              >
                Присоединиться к списку ожидания
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>
            {submitted && (
              <div className="mt-4 flex items-center justify-center gap-2 text-green-400">
                <CheckCircle className="h-5 w-5" />
                Спасибо! Мы уведомим вас о запуске.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-24">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white/5 p-6">
            <FileText className="mb-4 h-12 w-12 text-blue-400" />
            <h3 className="mb-2 text-xl font-semibold">Контент</h3>
            <p className="text-gray-400">
              Создавайте документы, таблицы и базы данных. Организуйте информацию с помощью тегов и связей между документами.
            </p>
          </div>
          <div className="rounded-xl bg-white/5 p-6">
            <ImageIcon className="mb-4 h-12 w-12 text-purple-400" />
            <h3 className="mb-2 text-xl font-semibold">Визуализация</h3>
            <p className="text-gray-400">Создавайте интеллект-карты, диаграммы и графики. Визуализируйте процессы и связи между идеями.</p>
          </div>
          <div className="rounded-xl bg-white/5 p-6">
            <Lightbulb className="mb-4 h-12 w-12 text-yellow-400" />
            <h3 className="mb-2 text-xl font-semibold">Идеи</h3>
            <p className="text-gray-400">Инструменты для брейнсторминга, доски для командного обсуждения и система для развития идей.</p>
          </div>
          <div className="rounded-xl bg-white/5 p-6">
            <Notebook className="mb-4 h-12 w-12 text-green-400" />
            <h3 className="mb-2 text-xl font-semibold">Заметки</h3>
            <p className="text-gray-400">Быстрые заметки, детальные конспекты и система персональных знаний с поддержкой Markdown.</p>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white/5 p-8">
          <h2 className="mb-8 text-center text-3xl font-bold">Почему КВИЗ?</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex gap-4">
              <div className="h-fit rounded-lg bg-blue-500/20 p-3">
                <LayoutGrid className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Всё в одном месте</h3>
                <p className="text-gray-400">Больше никаких переключений между приложениями. Вся ваша работа в едином пространстве.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-fit rounded-lg bg-purple-500/20 p-3">
                <Split className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Гибкая структура</h3>
                <p className="text-gray-400">Организуйте информацию так, как удобно именно вам. Никаких ограничений.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto mt-16 border-t border-white/10 px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <img src="/qiz-favicon-128x128.png" className="h-12 w-12" alt="Qiz logo" />
            <span className="font-bold">КВИЗ</span>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-gray-400">© 2025 КВИЗ. Все права защищены.</p>
            <div className="h-4 w-px bg-gray-700"></div>
            <a
              href="https://giglabo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 transition-colors hover:text-white"
            >
              <span>Powered by</span>
              <img src="/logo_giglabo_color_transp.png" className="h-8 w-8" />
              <span className="font-semibold">GigLabo</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
