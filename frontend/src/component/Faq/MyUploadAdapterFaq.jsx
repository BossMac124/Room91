// 📌 CKEditor에서 사용할 이미지 업로더를 정의해주는 클래스

class MyUploadAdapter {
    constructor(loader) {
        // CKEditor 내부에서 이미지 파일 정보를 관리하는 객체
        this.loader = loader;
    }

    // 업로드를 실행하는 함수 (CKEditor에서 자동으로 호출됨)
    upload() {
        return this.loader.file.then((file) => {
            const data = new FormData();         // 이미지 전송을 위한 FormData 객체 생성
            data.append("upload", file);         // 'upload'라는 키에 파일을 추가

            // fetch로 백엔드 API에 POST 요청 → 이미지 업로드
            return fetch(`/api/faq/upload/image`, {
                method: "POST",
                body: data,                       // 전송할 데이터 (이미지)
                credentials: "include",           // 쿠키나 인증 정보 포함 (세션 등 필요할 때)
            })
                .then((res) => res.json())        // 응답을 JSON으로 변환
                .then((res) => {
                    // 응답에 이미지 URL이 있을 경우
                    if (res && res.url) {
                        // CKEditor가 이미지를 표시할 수 있도록 URL을 리턴
                        return { default: res.url };
                    }
                    // 실패한 경우 에러 발생
                    throw new Error("이미지 업로드 실패");
                });
        });
    }

    // 업로드 중단할 때 호출되는 함수 (필수로 정의해야 하지만 비워둬도 됨)
    abort() {}
}

// 📌 CKEditor에 우리가 만든 업로드 어댑터(MyUploadAdapter)를 연결해주는 역할
export default function MyCustomUploadAdapterPlugin(editor) {
    // CKEditor의 파일 업로드 기능을 커스터마이징
    editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
        // 새로운 업로드 어댑터를 만들어서 리턴
        return new MyUploadAdapter(loader);
    };
}