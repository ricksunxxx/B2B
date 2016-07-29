CKEDITOR.plugins.add('uploadImg', {
    icons: 'uploadImg',
    init: function (editor) {
        // Plugin logic goes here...
        editor.addCommand('uploadImgDialog', new CKEDITOR.dialogCommand('uploadImgDialog'));
        editor.ui.addButton('UploadImg', {
            label: '上传图片',
            command: 'uploadImgDialog',
            toolbar: 'custom'
        });

        CKEDITOR.dialog.add('uploadImgDialog', this.path + 'dialogs/uploadImg.js');
    }
});