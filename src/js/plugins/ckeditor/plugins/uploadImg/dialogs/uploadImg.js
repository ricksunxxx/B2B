CKEDITOR.dialog.add('uploadImgDialog', function (editor) {
    return {
        //... here goes the dialog defition ...
        title: '上传图片',
        minWidth: 410,
        minHeight: 120,

        contents: [
            {
                id: 'tab-iframe',
                elements: [
                    {
                        type: 'html',
                        html: '<iframe id="uploadImgFrame" src="/Upload" style="width:358px; height:395px" ></iframe>'
                    }
                ]
            }
        ],
        onOk: function () {
            var imgContainer = $('#uploadImgFrame').contents().find('#imgContainerID')

            var html = imgContainer.html();
            var imgReg = /<img[^<]+>/gi;
            var imgs = html.match(imgReg);
            var markReg = /W100H100/;
            var styleReg = /style=".+?"/;
            var dragMark = /draggable="false"/;
            for (var i = 0; i < imgs.length; i++) {
                var img = imgs[i].replace(markReg, "W600H600");
                img = img.replace(styleReg, "");
                img = img.replace(dragMark, "");
                var element = CKEDITOR.dom.element.createFromHtml('<p>' + img + '</p>');
                element.removeAttribute("style")
                editor.insertElement(element);
            }

            imgContainer.find('.img-item').remove();
        },
        onCancel: function () {
            var imgContainer = $('#uploadImgFrame').contents().find('#imgContainerID');
            imgContainer.find('.img-item').remove();
        }
    };
});