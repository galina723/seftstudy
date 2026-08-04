"use client";

import { useState, useEffect } from "react";

type User = {
  id: number;
  username: string;
};

type Note = {
  id: number;
  userId: number;
  content: string;
};

type Lesson = {
  id: number;
  author: string;
  category: string;
  title: string;
  content: string;
};

type Quiz = {
  id: number;
  author: string;
  category: string;
  title: string;
  question: string;
  options: string[];
  answer: string;
};

type AppData = {
  notes: Note[];
  lessons: Lesson[];
  quizzes: Quiz[];
  categories?: any[];
};

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginInput, setLoginInput] = useState("");

  const [data, setData] = useState<AppData>({
    notes: [],
    lessons: [],
    quizzes: [],
  });

  const [activeTab, setActiveTab] = useState<"lessons" | "quizzes">("lessons");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [modalType, setModalType] = useState<"note" | "lesson" | "quiz" | null>(
    null,
  );
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [activeId, setActiveId] = useState<number | null>(null);

  const [formContent, setFormContent] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formQ, setFormQ] = useState("");
  const [formOpt, setFormOpt] = useState("");
  const [formAns, setFormAns] = useState("");

  const [viewLesson, setViewLesson] = useState<Lesson | null>(null);
  const [viewQuiz, setViewQuiz] = useState<Quiz | null>(null);
  const [quizSelectedOpt, setQuizSelectedOpt] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("study_user");

    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
      } catch {
        localStorage.removeItem("study_user");
      }
    }
  }, []);

  const fetchData = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/data", {
        headers: {
          "x-user-id": currentUser.id.toString(),
        },
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    fetchData();
  }, [currentUser]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: loginInput,
        password: "123456",
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      alert(result.message || "Login thất bại");
      return;
    }

    localStorage.setItem("study_user", JSON.stringify(result.user));
    setCurrentUser(result.user);
    setLoginInput("");
  };

  const handleLogout = () => {
    localStorage.removeItem("study_user");
    setCurrentUser(null);
  };

  const openAddModal = (type: "note" | "lesson" | "quiz", defaultCat = "") => {
    setModalType(type);
    setModalMode("add");
    setActiveId(null);
    setFormContent("");
    setFormCategory(defaultCat || selectedCategory || "");
    setFormTitle("");
    setFormQ("");
    setFormOpt("");
    setFormAns("");
  };

  const openEditModal = (type: "note" | "lesson" | "quiz", item: any) => {
    setModalType(type);
    setModalMode("edit");
    setActiveId(item.id);

    if (type === "note") {
      setFormContent(item.content || "");
    } else if (type === "lesson") {
      setFormCategory(item.category || "");
      setFormTitle(item.title || "");
      setFormContent(item.content || "");
    } else if (type === "quiz") {
      setFormCategory(item.category || "");
      setFormTitle(item.title || "");
      setFormQ(item.question || "");
      setFormOpt(item.options ? item.options.join(", ") : "");
      setFormAns(item.answer || "");
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalType || !currentUser) return;

    const endpointMap = {
      note: "notes",
      lesson: "lessons",
      quiz: "quizzes",
    };

    const endpoint = endpointMap[modalType];
    let payload: any = {};

    if (modalType === "note") {
      payload = { id: activeId, content: formContent };
    } else if (modalType === "lesson") {
      payload = {
        id: activeId,
        category: formCategory || "General",
        title: formTitle,
        content: formContent,
      };
    } else if (modalType === "quiz") {
      payload = {
        id: activeId,
        category: formCategory || "General",
        title: formTitle,
        question: formQ,
        options: formOpt.split(",").map((x) => x.trim()),
        answer: formAns,
      };
    }

    await fetch(`/api/${endpoint}`, {
      method: modalMode === "add" ? "POST" : "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": currentUser.id.toString(),
      },
      body: JSON.stringify(payload),
    });

    setModalType(null);
    fetchData();
  };

  const handleDelete = async (endpoint: string, id: number) => {
    if (!currentUser) return;
    if (!confirm("Xác nhận xóa bản ghi này nhé?")) return;

    await fetch(`/api/${endpoint}?id=${id}`, {
      method: "DELETE",
      headers: {
        "x-user-id": currentUser.id.toString(),
      },
    });

    fetchData();
  };

  if (!currentUser) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 flex items-center justify-center p-6 text-teal-900 font-sans">
        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[35px] border border-teal-100 shadow-xl shadow-teal-900/5 w-full max-w-md relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-100/50 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-100/50 rounded-full blur-2xl pointer-events-none"></div>

          <div className="mb-8 text-center">
            <div className="w-14 h-14 bg-gradient-to-tr from-cyan-400 to-teal-400 text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-md shadow-teal-200">
              🌿
            </div>
            <h1 className="text-2xl font-extrabold text-teal-950 tracking-tight">
              Minty Workspace
            </h1>
            <p className="text-sm text-teal-600/70 mt-1.5 font-medium">
              Đăng nhập để vào không gian học tập thư thái 🌱
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-teal-800 mb-2">
                Tên tài khoản 🍃
              </label>
              <input
                type="text"
                className="w-full px-4 py-3.5 bg-teal-50/40 border border-teal-200/80 rounded-2xl text-sm text-teal-950 placeholder-teal-400/60 focus:outline-none focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100 transition-all shadow-inner"
                placeholder="Nhập username..."
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-white py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-teal-200 hover:shadow-xl hover:scale-[1.01] active:scale-95 transition-all"
            >
              Vào Không Gian 💧
            </button>

            <div className="text-xs text-teal-500 mt-4 text-center bg-teal-50/50 p-3 rounded-2xl border border-teal-100">
              <p className="font-semibold text-teal-700 mb-0.5">Tài khoản demo:</p>
              <p>admin / 123456 • user / 123456</p>
            </div>
          </form>
        </div>
      </main>
    );
  }

  const currentItems = activeTab === "lessons" ? data.lessons : data.quizzes;
  const categories = Array.from(
    new Set(currentItems.map((i) => i.category || "General")),
  );
  const itemsInSelectedCategory = selectedCategory
    ? currentItems.filter((i) => (i.category || "General") === selectedCategory)
    : [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-50/60 via-teal-50/40 to-emerald-50/60 text-teal-900 font-sans pb-20">
      {/* HEADER */}
      <header className="bg-white/70 backdrop-blur-md border-b border-teal-100/80 sticky top-0 z-20 shadow-xs">
        <div className="max-w-5xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-gradient-to-tr from-cyan-400 to-teal-400 text-white rounded-2xl flex items-center justify-center text-sm font-bold shadow-sm shadow-teal-200">
              🌿
            </div>
            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent">
              Minty Workspace ✨
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <span className="text-teal-700/80 bg-teal-50 px-4 py-2 rounded-2xl border border-teal-100">
              Xin chào:
              <strong className="text-teal-950 font-bold ml-1.5">
                {currentUser.username} 🍃
              </strong>
            </span>
            <button
              onClick={handleLogout}
              className="text-teal-500 hover:text-emerald-700 font-semibold transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-8 pt-10 space-y-8">
        {/* GHI CHÚ NHANH */}
        <section className="bg-white/80 backdrop-blur-md rounded-[30px] border border-teal-100 p-8 shadow-xl shadow-teal-900/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-cyan-100/40 rounded-full blur-xl pointer-events-none"></div>
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 flex items-center gap-1.5">
              <span>💧</span> Ghi chú nhanh
            </h2>
            <button
              onClick={() => openAddModal("note")}
              className="text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-4 py-2.5 rounded-xl transition-all shadow-xs border border-teal-100"
            >
              + Thêm ghi chú 🍃
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.notes.map((n) => (
              <div
                key={n.id}
                className="bg-gradient-to-br from-cyan-50/30 to-teal-50/30 p-5 rounded-2xl border border-teal-100/80 flex flex-col justify-between gap-4 text-sm shadow-xs hover:shadow-md transition-all group"
              >
                <p className="text-teal-950/80 leading-relaxed line-clamp-4 font-medium">
                  {n.content}
                </p>
                <div className="flex justify-end gap-4 pt-3 border-t border-teal-100/60 text-xs">
                  <button
                    onClick={() => openEditModal("note", n)}
                    className="text-teal-600 hover:text-teal-900 font-semibold"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete("notes", n.id)}
                    className="text-rose-400 hover:text-rose-600 font-semibold"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}

            {data.notes.length === 0 && (
              <div className="col-span-full py-10 text-center text-sm text-teal-400 font-medium">
                Chưa có ghi chú nào. Hãy tạo ghi chú mới nhé! 🌿
              </div>
            )}
          </div>
        </section>

        {/* KHU VỰC CHÍNH */}
        <section className="bg-white/80 backdrop-blur-md rounded-[30px] border border-teal-100 p-8 shadow-xl shadow-teal-900/5 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-teal-100">
            <div className="flex bg-teal-50/70 p-1.5 rounded-2xl gap-1.5 border border-teal-100">
              <button
                onClick={() => {
                  setActiveTab("lessons");
                  setSelectedCategory(null);
                }}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  activeTab === "lessons"
                    ? "bg-white text-teal-800 shadow-sm shadow-teal-200"
                    : "text-teal-600/70 hover:text-teal-900"
                }`}
              >
                📖 Bài học
              </button>
              <button
                onClick={() => {
                  setActiveTab("quizzes");
                  setSelectedCategory(null);
                }}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  activeTab === "quizzes"
                    ? "bg-white text-teal-800 shadow-sm shadow-teal-200"
                    : "text-teal-600/70 hover:text-teal-900"
                }`}
              >
                🎯 Trắc nghiệm Quiz
              </button>
            </div>

            <button
              onClick={() =>
                openAddModal(
                  activeTab === "lessons" ? "lesson" : "quiz",
                  selectedCategory || "",
                )
              }
              className="bg-gradient-to-r from-teal-500 to-emerald-400 text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-md shadow-teal-200 hover:shadow-lg hover:scale-[1.01] transition-all"
            >
              + Tạo {activeTab === "lessons" ? "bài học" : "quiz"} mới 🌿
            </button>
          </div>

          {!selectedCategory ? (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-4 flex items-center gap-1.5">
                <span>📂</span> Thư mục phân loại
              </h3>

              {categories.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-teal-200 rounded-3xl bg-teal-50/20">
                  <p className="text-sm text-teal-500 font-medium">
                    Chưa có danh mục nào được tạo. 🌱
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {categories.map((cat, idx) => {
                    const count = currentItems.filter(
                      (i) => (i.category || "General") === cat,
                    ).length;

                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedCategory(cat)}
                        className="p-6 rounded-2xl border border-teal-100 hover:border-teal-300 bg-gradient-to-br from-white to-teal-50/30 hover:shadow-lg hover:shadow-teal-100 cursor-pointer transition-all group"
                      >
                        <span className="text-xs font-mono text-teal-500 uppercase tracking-widest font-semibold">
                          Category ✨
                        </span>
                        <h4 className="text-base font-extrabold text-teal-950 mt-1.5 group-hover:text-teal-700 transition-colors">
                          {cat}
                        </h4>
                        <div className="flex justify-between items-center mt-6 pt-4 border-t border-teal-100 text-sm text-teal-500 font-medium">
                          <span>{count} mục</span>
                          <span className="font-bold text-teal-700 group-hover:translate-x-1 transition-transform">
                            Xem ngay →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between bg-teal-50/60 px-5 py-3.5 rounded-2xl border border-teal-100 text-sm">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="font-bold text-teal-700 hover:text-teal-950 transition-colors"
                >
                  ← Quay lại danh mục
                </button>
                <span className="text-teal-600">
                  Đang lọc theo:
                  <strong className="text-teal-950 font-bold ml-1.5">
                    {selectedCategory} 💧
                  </strong>
                </span>
              </div>

              <div className="space-y-3">
                {itemsInSelectedCategory.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl border border-teal-100 bg-white hover:border-teal-300 hover:shadow-md transition-all flex justify-between items-center"
                  >
                    <div className="space-y-1.5 pr-4">
                      {activeTab === "lessons" ? (
                        <>
                          <h4
                            onClick={() => setViewLesson(item)}
                            className="text-base font-extrabold text-teal-950 cursor-pointer hover:text-teal-700 transition-colors"
                          >
                            {item.title}
                          </h4>
                          <p className="text-sm text-teal-800/70 line-clamp-1 font-medium">
                            {item.content}
                          </p>
                        </>
                      ) : (
                        <>
                          <h4
                            onClick={() => {
                              setViewQuiz(item);
                              setQuizSelectedOpt(null);
                              setQuizSubmitted(false);
                            }}
                            className="text-base font-extrabold text-teal-950 cursor-pointer hover:text-teal-700 transition-colors"
                          >
                            {item.title}: {item.question}
                          </h4>
                          <span className="text-xs text-teal-500 font-medium">
                            {item.options?.length} lựa chọn đáp án
                          </span>
                        </>
                      )}
                      <span className="text-xs text-teal-400 block font-mono">
                        Tác giả: {item.author} 🍃
                      </span>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {activeTab === "lessons" ? (
                        <button
                          onClick={() => setViewLesson(item)}
                          className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-xl transition-all border border-teal-100"
                        >
                          Đọc 📖
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setViewQuiz(item);
                            setQuizSelectedOpt(null);
                            setQuizSubmitted(false);
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-400 text-white hover:opacity-90 font-bold rounded-xl transition-all shadow-sm shadow-teal-200"
                        >
                          Làm Quiz 🎯
                        </button>
                      )}

                      {item.author === currentUser.username && (
                        <div className="flex gap-3 pl-3 border-l border-teal-100">
                          <button
                            onClick={() =>
                              openEditModal(
                                activeTab === "lessons" ? "lesson" : "quiz",
                                item,
                              )
                            }
                            className="text-teal-600 hover:text-teal-900 font-bold text-sm"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(
                                activeTab === "lessons" ? "lessons" : "quizzes",
                                item.id,
                              )
                            }
                            className="text-rose-400 hover:text-rose-600 font-bold text-sm"
                          >
                            Xóa
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {itemsInSelectedCategory.length === 0 && (
                  <div className="p-12 text-center text-sm text-teal-400 font-medium">
                    Không có bản ghi nào trong mục này cả. 🌱
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* MODAL FORM (THÊM / SỬA) */}
      {modalType && (
        <div className="fixed inset-0 bg-teal-950/20 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-[30px] border border-teal-100 p-8 w-full max-w-xl shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-4 border-b border-teal-100">
              <h3 className="text-base font-extrabold text-teal-950">
                {modalMode === "add" ? "Thêm mới bản ghi ✨" : "Chỉnh sửa bản ghi 🌿"}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-teal-400 hover:text-teal-900 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4 text-sm">
              {modalType === "note" && (
                <div>
                  <label className="block font-semibold text-teal-800 mb-1.5">
                    Nội dung ghi chú 💧
                  </label>
                  <textarea
                    className="w-full p-4 border border-teal-200 rounded-2xl bg-teal-50/30 focus:outline-none focus:border-teal-400 focus:bg-white text-teal-950"
                    rows={6}
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    required
                  />
                </div>
              )}

              {modalType === "lesson" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-teal-800 mb-1.5">
                        Danh mục 🌿
                      </label>
                      <input
                        className="w-full p-3.5 border border-teal-200 rounded-2xl bg-teal-50/30 text-teal-950 focus:outline-none focus:border-teal-400"
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-teal-800 mb-1.5">
                        Tiêu đề 🍃
                      </label>
                      <input
                        className="w-full p-3.5 border border-teal-200 rounded-2xl bg-teal-50/30 text-teal-950 focus:outline-none focus:border-teal-400"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <label className="block font-semibold text-teal-800 mb-1.5">
                    Nội dung bài học 📖
                  </label>
                  <textarea
                    className="w-full p-4 border border-teal-200 rounded-2xl bg-teal-50/30 text-teal-950 focus:outline-none focus:border-teal-400"
                    rows={8}
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    required
                  />
                </>
              )}

              {modalType === "quiz" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-teal-800 mb-1.5">
                        Danh mục 🌿
                      </label>
                      <input
                        className="w-full p-3.5 border border-teal-200 rounded-2xl bg-teal-50/30 text-teal-950 focus:outline-none focus:border-teal-400"
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-teal-800 mb-1.5">
                        Tên bộ Quiz ✨
                      </label>
                      <input
                        className="w-full p-3.5 border border-teal-200 rounded-2xl bg-teal-50/30 text-teal-950 focus:outline-none focus:border-teal-400"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <label className="block font-semibold text-teal-800 mb-1.5">
                    Câu hỏi 🎯
                  </label>
                  <input
                    className="w-full p-3.5 border border-teal-200 rounded-2xl bg-teal-50/30 text-teal-950 focus:outline-none focus:border-teal-400"
                    value={formQ}
                    onChange={(e) => setFormQ(e.target.value)}
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-teal-800 mb-1.5">
                        Các đáp án (cách nhau bởi dấu phẩy)
                      </label>
                      <input
                        placeholder="A, B, C, D"
                        className="w-full p-3.5 border border-teal-200 rounded-2xl bg-teal-50/30 text-teal-950 focus:outline-none focus:border-teal-400"
                        value={formOpt}
                        onChange={(e) => setFormOpt(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-teal-800 mb-1.5">
                        Đáp án đúng ✨
                      </label>
                      <input
                        className="w-full p-3.5 border border-teal-200 rounded-2xl bg-teal-50/30 text-teal-950 focus:outline-none focus:border-teal-400"
                        value={formAns}
                        onChange={(e) => setFormAns(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4 border-t border-teal-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="flex-1 bg-teal-50 text-teal-700 hover:bg-teal-100 py-3.5 rounded-2xl font-bold transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-400 text-white py-3.5 rounded-2xl font-bold shadow-md shadow-teal-200 hover:opacity-95 transition-all"
                >
                  Lưu lại 🌿
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XEM BÀI HỌC */}
      {viewLesson && (
        <div className="fixed inset-0 bg-teal-950/20 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-[30px] border border-teal-100 p-8 w-full max-w-2xl shadow-2xl space-y-5 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-teal-100">
              <div>
                <span className="text-xs font-mono text-teal-500 uppercase font-semibold">
                  {viewLesson.category} ✨
                </span>
                <h3 className="text-xl font-extrabold text-teal-950 mt-1">
                  {viewLesson.title}
                </h3>
              </div>
              <button
                onClick={() => setViewLesson(null)}
                className="text-teal-400 hover:text-teal-900 text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <div className="text-teal-900/80 whitespace-pre-line leading-relaxed text-sm font-medium">
              {viewLesson.content}
            </div>
            <div className="pt-4 border-t border-teal-100 flex justify-between items-center text-xs text-teal-500">
              <span>Tác giả: {viewLesson.author} 🍃</span>
              <button
                onClick={() => setViewLesson(null)}
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-400 text-white font-bold rounded-xl shadow-sm shadow-teal-200"
              >
                Đóng 🌿
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LÀM QUIZ */}
      {viewQuiz && (
        <div className="fixed inset-0 bg-teal-950/20 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-[30px] border border-teal-100 p-8 w-full max-w-xl shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-4 border-b border-teal-100">
              <div>
                <span className="text-xs font-mono text-teal-500 uppercase font-semibold">
                  {viewQuiz.category} - {viewQuiz.title} ✨
                </span>
                <h3 className="text-lg font-extrabold text-teal-950 mt-1">
                  {viewQuiz.question}
                </h3>
              </div>
              <button
                onClick={() => setViewQuiz(null)}
                className="text-teal-400 hover:text-teal-900 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {viewQuiz.options?.map((opt, idx) => {
                let btnStyle =
                  "bg-teal-50/40 border-teal-200 text-teal-900 hover:bg-teal-100/60";
                if (quizSubmitted) {
                  if (opt.trim() === viewQuiz.answer.trim()) {
                    btnStyle =
                      "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold";
                  } else if (quizSelectedOpt === opt) {
                    btnStyle = "bg-rose-50 border-rose-300 text-rose-800 font-bold";
                  }
                } else if (quizSelectedOpt === opt) {
                  btnStyle = "bg-gradient-to-r from-teal-500 to-emerald-400 text-white border-transparent font-bold shadow-sm shadow-teal-200";
                }

                return (
                  <button
                    key={idx}
                    disabled={quizSubmitted}
                    onClick={() => setQuizSelectedOpt(opt)}
                    className={`w-full p-4 rounded-2xl border text-left text-sm transition-all font-medium ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {quizSubmitted && (
              <div
                className={`p-4 rounded-2xl text-sm font-bold ${
                  quizSelectedOpt?.trim() === viewQuiz.answer.trim()
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {quizSelectedOpt?.trim() === viewQuiz.answer.trim()
                  ? "🎉 Chính xác rồi, bạn tuyệt lắm! ✨"
                  : `❌ Chưa chính xác. Đáp án đúng là: ${viewQuiz.answer} 🌿`}
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-teal-100">
              {!quizSubmitted ? (
                <button
                  disabled={!quizSelectedOpt}
                  onClick={() => setQuizSubmitted(true)}
                  className="w-full bg-gradient-to-r from-teal-500 to-emerald-400 text-white py-3.5 rounded-2xl font-bold disabled:opacity-50 shadow-md shadow-teal-200"
                >
                  Nộp bài 🎯
                </button>
              ) : (
                <button
                  onClick={() => setViewQuiz(null)}
                  className="w-full bg-teal-50 text-teal-900 py-3.5 rounded-2xl font-bold hover:bg-teal-100 transition-all border border-teal-100"
                >
                  Đóng 🌿
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}