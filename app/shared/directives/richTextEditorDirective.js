angular.module('blogApp')
.directive('richTextEditor', function() {
    return {
        restrict: 'E',
        scope: {
            content: '='
        },
        template: '<div class="editor"></div>',
        link: function(scope, element, attrs) {
            var editorDiv = element[0].querySelector('.editor');

            var quill = new Quill(editorDiv, {
                theme: 'snow'
            });

            // Initialize content if exists
            if (scope.content) quill.root.innerHTML = scope.content;

            // Sync Quill content to scope
            quill.on('text-change', function() {
                scope.$apply(function() {
                    scope.content = quill.root.innerHTML;
                });
            });
        }
    };
});
