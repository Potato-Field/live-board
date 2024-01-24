//live-board/src/component/TextEditor.tsx
import * as Y from "yjs";
import React, { FC, useState, useEffect } from 'react';
import { Layer, Text, Transformer } from 'react-konva';

export interface TextInputProps {
  init: string;
  x: number;
  y: number;
  isEditing: boolean;
}

//추가해야 할 요소 textTransformer
//textArea 객체로 생성하고 삭제하는 함수 구현해야 함
  //textInput동기화 시키기 
  //textArea 동기화 시키기
  



interface TextEditorProps {
  textInputs: TextInputProps[];
  setTextInputs: React.Dispatch<React.SetStateAction<TextInputProps[]>>;
  yTextRef: React.MutableRefObject<Y.Array<TextInputProps>>;
}

const TextEditor: FC<TextEditorProps> = ({ textInputs, setTextInputs, yTextRef }) => {

  const[textareaValue, setTextareaValue] = useState<string>("");

  const handleDbClick = (e: any, item: number) => {
    console.log("double click");
    console.log(e);
    var now_text = e.target;
    const pos = now_text.getStage().getPointerPosition();
    const stages = now_text.getStage();
    
    
    now_text.hide();
    const areaPos =  {
      x: stages.container().offsetLeft + pos.x,
      y: stages.container().offsetTop + pos.y
    };
    var textArea = document.createElement('textarea');
    document.body.appendChild(textArea);
    textArea.value = now_text.text();
    textArea.style.position = 'absolute';
    textArea.style.left = areaPos.x + 'px';
    textArea.style.top = areaPos.y + 'px';
    
    textArea.addEventListener('keydown', function(e){
      if(e.key === 'Enter' && !e.shiftKey){
        setTextareaValue(textArea.value);
        now_text.text(textArea.value);
        console.log(now_text);
        console.log(now_text.text());
        textArea.parentNode?.removeChild(textArea);
        
        const updatedTextInputs = textInputs.map((input, i) =>
        i === item ? { ...input, init: now_text.text() } : input
        );
        setTextInputs(updatedTextInputs);
        // const newYTextInput = { ...textInputs[item], init: textArea.value };
        // yTextRef.current.delete(item, 1);
        // yTextRef.current.insert(item, [newYTextInput]);
        now_text.show();
        console.log('enter change text!!');
      }
      const newYTextInput = { ...textInputs[item], init: textArea.value };
        yTextRef.current.delete(item, 1);
        yTextRef.current.insert(item, [newYTextInput]);
    });
  };

  

  
  return (
    <>
    {textInputs.map((textInput, i) => (
        <React.Fragment key={i}>
          
            <Text
              text={textInput.init}
              x={textInput.x}
              y={textInput.y}
              fill="#000000"
              fontSize={16}
              draggable
              
              onDragMove={(e) => {
                const updatedTextInputs = [...textInputs];
                updatedTextInputs[i].x = e.target.x();
                updatedTextInputs[i].y = e.target.y();
                const newTextProps = updatedTextInputs[i];
                setTextInputs(updatedTextInputs);
                yTextRef.current.delete(i, 1);
                yTextRef.current.insert(i, [newTextProps]);
  
              }}
               
              onDblClick={(e) => handleDbClick(e, i)}
            />
        
        </React.Fragment>
      ))}
      
    </>
  );

};

export default TextEditor;
