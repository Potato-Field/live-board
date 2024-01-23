import React, { useEffect } from 'react';
import Konva from 'konva';
import { Stage, Layer, Text, Rect, Transformer } from 'react-konva';

const TextInput: React.FC = () => {
    useEffect(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        const stage = new Konva.Stage({
            container: 'container',
            width: width,
            height: height,
        });

        const layer = new Konva.Layer();
        stage.add(layer);

        const textNode = new Konva.Text({
            text: 'Some text here',
            x: 50,
            y: 80,
            fontSize: 20,
            draggable: true,
            width: 200,
        });

        layer.add(textNode);

        const tr = new Konva.Transformer({
            node: textNode,
            enabledAnchors: ['middle-left', 'middle-right'],
            boundBoxFunc: function (oldBox, newBox) {
                newBox.width = Math.max(30, newBox.width);
                return newBox;
            },
        });

        textNode.on('transform', function () {
            textNode.setAttrs({
                width: textNode.width() * textNode.scaleX(),
                scaleX: 1,
            });
        });

        layer.add(tr);

        textNode.on('dblclick dbltap', (e: Konva.KonvaEventObject<MouseEvent>) => {
            textNode.hide();
            tr.hide();

            const textPosition = textNode.absolutePosition();
            const areaPosition = {
                x: stage.container().offsetLeft + textPosition.x,
                y: stage.container().offsetTop + textPosition.y,
            };

            const textarea = document.createElement('textarea');
            document.body.appendChild(textarea);

            textarea.value = textNode.text();
            textarea.style.position = 'absolute';
            textarea.style.top = areaPosition.y + 'px';
            textarea.style.left = areaPosition.x + 'px';
            textarea.style.width = textNode.width() - textNode.padding() * 2 + 'px';
            textarea.style.height =
                textNode.height() - textNode.padding() * 2 + 5 + 'px';
            textarea.style.fontSize = textNode.fontSize() + 'px';
            textarea.style.border = 'none';
            textarea.style.padding = '0px';
            textarea.style.margin = '0px';
            textarea.style.overflow = 'hidden';
            textarea.style.background = 'none';
            textarea.style.outline = 'none';
            textarea.style.resize = 'none';
            textarea.style.lineHeight = textNode.lineHeight().toString();
            textarea.style.fontFamily = textNode.fontFamily();
            textarea.style.transformOrigin = 'left top';
            textarea.style.textAlign = textNode.align();
            textarea.style.color = textNode.fill();

            const rotation = textNode.rotation();
            let transform = '';
            if (rotation) {
                transform += 'rotateZ(' + rotation + 'deg)';
            }

            let px = 0;
            const isFirefox =
                navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
            if (isFirefox) {
                px += 2 + Math.round(textNode.fontSize() / 20);
            }
            transform += 'translateY(-' + px + 'px)';

            textarea.style.transform = transform;

            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 3 + 'px';

            textarea.focus();

            const removeTextarea = () => {
                if (textarea.parentNode) {
                    textarea.parentNode.removeChild(textarea);
                    window.removeEventListener('click', handleOutsideClick);
                    textNode.show();
                    tr.show();
                    tr.forceUpdate();
                }
            };

            const setTextareaWidth = (newWidth?: number) => {
                if (!newWidth) {
                    const currentNodeText = textNode.text();
                    newWidth = currentNodeText.length * textNode.fontSize();
                }

                const isSafari = /^((?!chrome|android).)*safari/i.test(
                    navigator.userAgent
                );
                const isFirefox =
                    navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
                if (isSafari || isFirefox) {
                    newWidth = Math.ceil(newWidth);
                }

                const isEdge =
                    //@ts-ignore
                    document.documentMode || /Edge/.test(navigator.userAgent);
                if (isEdge) {
                    newWidth += 1;
                }
                textarea.style.width = newWidth + 'px';
            };

            textarea.addEventListener('keydown', (e) => {
                if (e.keyCode === 13 && !e.shiftKey) {
                    textNode.text(textarea.value);
                    removeTextarea();
                }
                if (e.keyCode === 27) {
                    removeTextarea();
                }
            });

            textarea.addEventListener('keydown', (e) => {
                const scale = textNode.getAbsoluteScale().x;
                setTextareaWidth(textNode.width() * scale);
                textarea.style.height = 'auto';
                textarea.style.height =
                    textarea.scrollHeight + textNode.fontSize() + 'px';
            });

            const handleOutsideClick = (e: any) => {
                if (e.target !== textarea) {
                    textNode.text(textarea.value);
                    removeTextarea();
                }
            };

            setTimeout(() => {
                window.addEventListener('click', handleOutsideClick);
            });
        });
    }, []);

    return <div id="container"></div>;
};

export default TextInput;