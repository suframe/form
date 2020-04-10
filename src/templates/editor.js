class MyUploadAdapter {
    constructor(loader) {
        // The file loader instance to use during the upload.
        this.loader = loader;
    }

    // Starts the upload process.
    upload() {
        return this.loader.file
            .then(file => new Promise((resolve, reject) => {
                this._initRequest();
                this._initListeners(resolve, reject, file);
                this._sendRequest(file);
            }));
    }

    // Aborts the upload process.
    abort() {
        if (this.xhr) {
            this.xhr.abort();
        }
    }

    // Initializes the XMLHttpRequest object using the URL passed to the constructor.
    _initRequest() {
        const xhr = this.xhr = new XMLHttpRequest();

        // Note that your request may look different. It is up to you and your editor
        // integration to choose the right communication channel. This example uses
        // a POST request with JSON as a data structure but your configuration
        // could be different.
        xhr.open('POST', '/thinkadmin/main/upload', true);
        xhr.responseType = 'json';
    }

    // Initializes XMLHttpRequest listeners.
    _initListeners(resolve, reject, file) {
        const xhr = this.xhr;
        const loader = this.loader;
        const genericErrorText = `Couldn't upload file: ${file.name}.`;

        xhr.addEventListener('error', () => reject(genericErrorText));
        xhr.addEventListener('abort', () => reject());
        xhr.addEventListener('load', () => {
            const response = xhr.response;

            // This example assumes the XHR server's "response" object will come with
            // an "error" which has its own "message" that can be passed to reject()
            // in the upload promise.
            //
            // Your integration may handle upload errors in a different way so make sure
            // it is done properly. The reject() function must be called when the upload fails.
            if (!response || response.error) {
                return reject(response && response.error ? response.error.message : genericErrorText);
            }

            // If the upload is successful, resolve the upload promise with an object containing
            // at least the "default" URL, pointing to the image on the server.
            // This URL will be used to display the image in the content. Learn more in the
            // UploadAdapter#upload documentation.
            resolve({
                default: response.data.filePath
            });
        });

        // Upload progress when it is supported. The file loader has the #uploadTotal and #uploaded
        // properties which are used e.g. to display the upload progress bar in the editor
        // user interface.
        if (xhr.upload) {
            xhr.upload.addEventListener('progress', evt => {
                if (evt.lengthComputable) {
                    loader.uploadTotal = evt.total;
                    loader.uploaded = evt.loaded;
                }
            });
        }
    }

    // Prepares the data and sends the request.
    _sendRequest(file) {
        // Prepare the form data.
        const data = new FormData();

        data.append('file', file);

        // Important note: This is the right place to implement security mechanisms
        // like authentication and CSRF protection. For instance, you can use
        // XMLHttpRequest.setRequestHeader() to set the request headers containing
        // the CSRF token generated earlier by your application.

        // Send the request.
        this.xhr.send(data);
    }
}

function MyCustomUploadAdapterPlugin(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
        return new MyUploadAdapter(loader);
    };
}

Vue.component('editor', {
    props: [
        'value',
        'preview'
    ],
    data: function () {
        return {
            editor: window.ClassicEditor,
            editorConfig: {
                language: "zh-cn",
                fontSize: {
                    options: [8, 10, 'default', 14, 16, 18, 20, 22, 24, 26, 28, 32, 48]
                },
                fontFamily: {
                    options: ["宋体", "仿宋", "微软雅黑", "黑体", "仿宋_GB2312", "楷体", "隶书", "幼圆"]
                },
                image: {
                    // You need to configure the image toolbar, too, so it uses the new style buttons.
                    toolbar: ['imageTextAlternative', '|', 'imageStyle:alignLeft', 'imageStyle:full', 'imageStyle:alignRight'],

                    styles: [
                        // This option is equal to a situation where no style is applied.
                        'full',

                        // This represents an image aligned to the left.
                        'alignLeft',

                        // This represents an image aligned to the right.
                        'alignRight'
                    ]
                }
            }
        }
    },
    watch: {
        value(newName, oldName) {
            this.$emit('input', newName);
            console.log(newName)
        }
    },
    created: function () {

    },
    methods: {
        uploadImgHook() {
            return () => {
                console.error("undefined uploadImg Hook")
            }
        },
        onReady(editor) {
            let _this = this
            // Insert the toolbar before the editable area.
            editor.ui.getEditableElement().parentElement.insertBefore(
                editor.ui.view.toolbar.element,
                editor.ui.getEditableElement()
            );
            MyCustomUploadAdapterPlugin(editor)
        }
    },
    template: `

<el-row>
  <el-col :span="preview ? 12 : 24">
     <ckeditor
        @ready="onReady"
        :editor="editor"
        v-model="value"
        :config="editorConfig">
    </ckeditor>
    </el-col>
    <el-col :span="12" v-if="preview">
        <div class="ck-content" style="padding-left: 10px">
            <div v-html="value"></div>
        </div>
    </el-col>
</el-row>
`
})