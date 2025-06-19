class CustomUploadAdapter {
    constructor(loader) {
        this.loader = loader;
    }

    // 업로드 실행
    upload() {
        return this.loader.file
            .then(file => {
                const data = new FormData();
                data.append('upload', file);

                return fetch('http://localhost:8080/api/uploads', {
                    method: 'POST',
                    body: data
                })
                    .then(res => res.json())
                    .then(json => {
                        // CKEditor가 기대하는 형태
                        return { default: json.default };
                    });
            });
    }

    // 업로드 취소 (필요시 구현)
    abort() {
        // 예: 이곳에 abort 로직 넣기
    }
}
export default CustomUploadAdapter;