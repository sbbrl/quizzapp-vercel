"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Question {
  id: string;
  text: string;
  type: string;
  options: string | null;
  required: boolean;
  order: number;
}

interface Template {
  id: string;
  name: string;
  description: string;
  questions: Question[];
  createdAt: string;
  _count: {
    sessions: number;
  };
}

export default function ViewTemplatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session && params.id) {
      fetchTemplate();
    }
  }, [session, params.id]);

  const fetchTemplate = async () => {
    try {
      const response = await fetch(`/api/templates/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setTemplate(data);
      } else if (response.status === 404) {
        alert("Template not found");
        router.push("/admin/templates");
      }
    } catch (error) {
      console.error("Error fetching template:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!session || !template) {
    return null;
  }

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "text":
        return "Text Answer";
      case "dropdown":
        return "Dropdown (Single Choice)";
      case "radio":
        return "Radio (Multiple Choice)";
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link
            href="/admin/templates"
            className="text-xl font-bold text-gray-800 hover:text-gray-600"
          >
            ← Back to Templates
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {template.name}
            </h1>
            {template.description && (
              <p className="text-gray-600 mb-4">{template.description}</p>
            )}
            <div className="flex gap-4 text-sm text-gray-500">
              <span>
                📝 {template.questions.length} question
                {template.questions.length !== 1 ? "s" : ""}
              </span>
              <span>
                📊 Used in {template._count.sessions} session
                {template._count.sessions !== 1 ? "s" : ""}
              </span>
              <span>
                ✔️ {template.questions.filter((q) => q.required).length} required
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Questions</h2>
          {template.questions.map((question, index) => {
            const options = question.options ? JSON.parse(question.options) : [];

            return (
              <div
                key={question.id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {index + 1}. {question.text}
                      {question.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </h3>
                    <div className="flex gap-3 text-sm">
                      <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                        {getQuestionTypeLabel(question.type)}
                      </span>
                      {question.required && (
                        <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full font-medium">
                          Required
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {(question.type === "dropdown" || question.type === "radio") &&
                  options.length > 0 && (
                    <div className="mt-4 pl-4 border-l-4 border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Options:
                      </p>
                      <ul className="space-y-1">
                        {options.map((option: string, idx: number) => (
                          <li
                            key={idx}
                            className="flex items-center text-gray-700"
                          >
                            <span className="text-gray-400 mr-2">
                              {question.type === "radio" ? "○" : "▼"}
                            </span>
                            {option}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {question.type === "text" && (
                  <div className="mt-4 pl-4 border-l-4 border-gray-200">
                    <p className="text-sm text-gray-600 italic">
                      Participants will provide a text answer
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex gap-4">
          <Link
            href={`/admin/sessions/start?templateId=${template.id}`}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            🚀 Start Session with this Template
          </Link>
          <Link
            href="/admin/templates"
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Back to Templates
          </Link>
        </div>
      </main>
    </div>
  );
}
