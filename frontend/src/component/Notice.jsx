import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

function Notice() {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageInfo, setPageInfo] = useState({
        number: 0,
        totalPages: 0,
        first: true,
        last: false,
    });

    const [openIndex, setOpenIndex] = useState(null);
    const [editingIndex, setEditingIndex] = useState(null);
    const [editedTitle, setEditedTitle] = useState("");
    const [editedContent, setEditedContent] = useState("");

    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchType, setSearchType] = useState("title");
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    const getNotice = async (page = 0) => {
        setLoading(true);
        try {
            const res = await fetch(`${baseUrl}/api/notice?page=${page}`);
            const json = await res.json();
            setNotices(json.content);
            setPageInfo({
                number: json.number,
                totalPages: json.totalPages,
                first: json.first,
                last: json.last,
            });
        } catch (e) {
            console.error("공지 불러오기 실패", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getNotice(0);
    }, []);

    const toggleContent = (index) => {
        setOpenIndex((prev) => (prev === index ? null : index));
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `${baseUrl}/api/notice/search?keyword=${searchKeyword}&type=${searchType}&page=0`
            );
            const json = await res.json();
            setNotices(json.content);
            setPageInfo({
                number: json.number,
                totalPages: json.totalPages,
                first: json.first,
                last: json.last,
            });
        } catch (e) {
            console.error("검색 실패", e);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const startEditing = (index) => {
        setEditingIndex(index);
        setEditedTitle(notices[index].title);
        setEditedContent(notices[index].content);
    };

    const cancelEditing = () => {
        setEditingIndex(null);
        setEditedTitle("");
        setEditedContent("");
    };

    const saveEditing = async (id) => {
        try {
            const res = await fetch(`${baseUrl}/api/notice/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: editedTitle,
                    content: editedContent,
                }),
            });
            if (!res.ok) throw new Error("수정 실패");

            await getNotice(pageInfo.number);
            cancelEditing();
        } catch (e) {
            console.error(e);
            alert("수정에 실패했습니다.");
        }
    };

    const deleteNotice = async (id) => {
        if (!window.confirm("정말 삭제할까요?")) return;
        try {
            const res = await fetch(`${baseUrl}/api/notice/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("삭제 실패");

            await getNotice(pageInfo.number);
        } catch (e) {
            console.error(e);
            alert("삭제에 실패했습니다.");
        }
    };

    return (
        <div>
            {loading ? (
                <p>로딩중...</p>
            ) : (
                <>
                    <div style={{ marginBottom: "1rem" }}>
                        <Link to="/notice/create">
                            <button>공지사항 작성</button>
                        </Link>
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                        <input
                            type="text"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="검색어 입력"
                            style={{ marginRight: "0.5rem" }}
                        />
                        <select
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value)}
                            style={{ marginRight: "0.5rem" }}
                        >
                            <option value="title">제목</option>
                            <option value="content">내용</option>
                            <option value="title_content">제목+내용</option>
                        </select>
                        <button onClick={handleSearch}>검색</button>
                    </div>

                    {notices.map((notice, index) => (
                        <div
                            key={notice.id}
                            className="notice"
                            style={{
                                marginBottom: "1rem",
                                borderBottom: "1px solid #ddd",
                                paddingBottom: "1rem",
                            }}
                        >
                            {editingIndex === index ? (
                                <>
                                    <input
                                        type="text"
                                        value={editedTitle}
                                        onChange={(e) => setEditedTitle(e.target.value)}
                                        style={{
                                            display: "block",
                                            marginBottom: "0.5rem",
                                            width: "100%",
                                        }}
                                    />
                                    <CKEditor
                                        editor={ClassicEditor}
                                        data={editedContent}
                                        onChange={(event, editor) => {
                                            const data = editor.getData();
                                            setEditedContent(data);
                                        }}
                                    />
                                    <button
                                        onClick={() => saveEditing(notice.id)}
                                        style={{ marginTop: "0.5rem", marginRight: "0.5rem" }}
                                    >
                                        저장
                                    </button>
                                    <button onClick={cancelEditing}>취소</button>
                                </>
                            ) : (
                                <>
                                    <div
                                        onClick={() => toggleContent(index)}
                                        style={{
                                            cursor: "pointer",
                                            fontWeight: "bold",
                                            fontSize: "1.2rem",
                                            marginBottom: "0.3rem",
                                        }}
                                    >
                                        {notice.title}
                                    </div>
                                    {openIndex === index && (
                                        <div
                                            style={{ padding: "0.5rem 1rem", backgroundColor: "#f9f9f9" }}
                                            dangerouslySetInnerHTML={{ __html: notice.content }}
                                        />
                                    )}
                                    <div style={{ marginTop: "0.5rem" }}>
                                        <button
                                            onClick={() => startEditing(index)}
                                            style={{ marginRight: "0.5rem" }}
                                        >
                                            수정
                                        </button>
                                        <button onClick={() => deleteNotice(notice.id)}>삭제</button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}

                    <div className="pagination" style={{ marginTop: "1rem" }}>
                        <button
                            onClick={() => getNotice(pageInfo.number - 1)}
                            disabled={pageInfo.first}
                            style={{ marginRight: "1rem" }}
                        >
                            이전
                        </button>
                        <span>
              {pageInfo.number + 1} / {pageInfo.totalPages}
            </span>
                        <button
                            onClick={() => getNotice(pageInfo.number + 1)}
                            disabled={pageInfo.last}
                            style={{ marginLeft: "1rem" }}
                        >
                            다음
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default Notice;
