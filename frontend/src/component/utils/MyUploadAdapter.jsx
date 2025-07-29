// 📌 CKEditor에서 사용할 이미지 업로더를 정의해주는 클래스
const baseUrl = import.meta.env.VITE_API_BASE_URL;

class MyUploadAdapter {
    constructor(loader, uploadPath) {
        this.loader = loader;
        this.uploadPath = uploadPath; // 예: "/api/faq/upload/image"
    }

    async upload() {
        const file = await this.loader.file;

        if (!file || !(file instanceof File)) {
            console.warn("업로드할 파일이 없거나 유효하지 않습니다.");
            throw new Error("유효하지 않은 파일입니다.");
        }

        const token = localStorage.getItem("jwt");
        const formData = new FormData();
        formData.append("upload", file);

        try {
            const response = await fetch(`${baseUrl}${this.uploadPath}`, {
                method: "POST",
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`이미지 업로드 실패: ${response.status} ${errorText}`);
            }

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("서버 응답이 JSON 형식이 아닙니다.");
            }

            const resJson = await response.json();
            console.log("📦 업로드 응답:", resJson);

            if (resJson && resJson.url) {
                // ✅ 절대 경로 보정 처리
                const imageUrl = resJson.url.startsWith("http")
                    ? resJson.url
                    : `${baseUrl}${resJson.url}`;

                return { default: imageUrl };
            } else {
                throw new Error("이미지 업로드 실패: URL이 없습니다.");
            }
        } catch (err) {
            console.error("CKEditor 이미지 업로드 중 에러 발생:", err);
            throw err;
        }
    }

    abort() {
        // 필요시 구현
    }
}

// 📌 커스텀 업로드 어댑터를 CKEditor에 연결하는 함수
export function MyCustomUploadAdapterPlugin(uploadPath) {
    return function (editor) {
        editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
            return new MyUploadAdapter(loader, uploadPath);
        };
    };
}
