//live-board/src/component/TextEditor.tsx
import * as Y from "yjs";
import React, { FC, useState } from 'react';
import {Text, Rect} from 'react-konva';

export interface TextInputProps {
  init: string;
  x: number;
  y: number;
  isEditing: boolean;
  //textbox: TextBox;
  //textareaId: string;
}

// export interface TextBox{
//     id: string;
//     x: number;
//     y: number;
    
// }

export interface TextAreaData {
    item: string;
    value: string;
    x: string;
    y: string;
  }
  
//추가해야 할 요소 textTransformer
//textArea 객체로 생성하고 삭제하는 함수 구현해야 함
  //textInput동기화 시키기 
  //textArea 동기화 시키기
  



interface TextEditorProps {
  textInputs: TextInputProps[];
  setTextInputs: React.Dispatch<React.SetStateAction<TextInputProps[]>>;
  yTextRef: React.MutableRefObject<Y.Array<TextInputProps>>;
  yDocRef: React.MutableRefObject<Y.Doc>;
}

const TextEditor: FC<TextEditorProps> = ({ textInputs, setTextInputs, yTextRef, yDocRef }) => {
  console.log(yDocRef)
   const[textareaValues, setTextareaValues] = useState<TextAreaData[]>([]);
//   const textareaRef = useRef(null);
//const yTextRef = useRef<Y.Array<TextInputProps>>(yDocRef.current.getArray<TextInputProps>('texts'));
// const [textAreas, setTextAreas] = useState<TextAreaData[]>([]);
   //const yTextAreaRef = useRef<Y.Array<TextAreaData>>(yDocRef.current.getArray<TextAreaData>('textareas'));

// useEffect(() => {
//     textInputs.forEach((tip, index) => {
//         const newTextAreaData: TextAreaData = { item: index, value: tip.init, x: tip.x, y: tip.y };
//         yTextAreaRef.current.push([newTextAreaData]);
//       });
//       setTextAreas(yTextAreaRef.current.toArray());
    
//     // console.log("!!!ytextref");
//     // console.log(yTextAreaRef);
//   }, [textInputs, yTextAreaRef]);


const handleDbClick = (e: any, item: number) => {
    var now_text = e.target;
    const pos = now_text.getStage().getPointerPosition();
    const stages = now_text.getStage();
  
    now_text.hide();
    const areaPos = {
      x: stages.container().offsetLeft + pos.x,
      y: stages.container().offsetTop + pos.y
    };
    var textArea = document.createElement('textarea');
    document.body.appendChild(textArea);
    textArea.value = now_text.text();
    textArea.style.position = 'absolute';
    textArea.style.left = areaPos.x + 'px';
    textArea.style.top = areaPos.y + 'px';
    textArea.id = `textarea-${item}`;

    // textAreas.forEach(item === id continue 
    //  else     const newTextAreaData: TextAreaData = { value: tip.init, x: tip.x, y: tip.y };
    //  setTextAreas.push(newTextAreaData);        //FIXX
    //  yTextAreaRef.current.push([newTextAreaData]);
    // );

    //변경하고자 하는 text 객체 
    // const newText: TextInputProps = { init: 'Text Click', x: pos.x, y: pos.y, isEditing: true };
    //   setTextInputs(prev => [...prev, newText]);
    //   yTextRef.current.push([newText]);

    

    const newTextArea: TextAreaData = {item: textArea.id, value: textArea.value, x: textArea.style.left, y:textArea.style.top};
    setTextareaValues(prev => [...prev, newTextArea]);
    console.log(newTextArea);
    console.log("settextarray!!!!!: ");
    console.log(textareaValues);                //FIXME


    
   
    textArea.addEventListener('keydown', function(e) {

        const updatedTextInputs = textInputs.map((input, i) => 
            i === item ? { ...input, init: textArea.value} : input
        );
        
        // const updatedTextArea = textareaValues.map((input, i) => {
        //     i === item ? {...input, value: textArea.value} : input 
        // });


        setTextInputs(updatedTextInputs);
        //setTextareaValues(updatedTextArea);
        yTextRef.current.delete(item, 1);
        yTextRef.current.insert(item, [{...updatedTextInputs[item]}]);

        // const updatedAreaData: TextAreaData = { item, value: textArea.value, x: textInputs[item].x, y: textInputs[item].y };
        // yTextAreaRef.current.delete(item);
        // yTextAreaRef.current.insert(item, [updatedAreaData]);


        // yTextAreaRef.current.observe(event => {
        //     event.changes.keys.forEach(change => {
        //       const updatedTextAreaData = yTextAreaRef.current.get(item);
        //       const textAreaElement = document.getElementById(`textarea-${item}`);
        //       if (textAreaElement) {
        //         textAreaElement.value = updatedTextAreaData.value;
        //       }
        //     });
        // });
        // console.log("!!!!")
        // console.log(updatedTextInputs);
        // console.log(updatedAreaData);

        
        // yTextRef.current.observe(event => {
        //     event.changes.keys.forEach(change => {
        //       const updatedTextInput = yTextRef.current.get(item);
        //        const textArea = document.getElementById(`textarea-${item}`);
        //        console.log(textArea);//test

        //       if (textArea) {

        //          textArea.value = updatedTextInput.init;
        //       }
        //     });
        //   });



        if(e.key == 'Enter' && !e.shiftKey){
            textArea.parentNode?.removeChild(textArea);
            now_text.show();
        }
        
    });

    // yTextRef.current.observe(event => {
    //     event.changes.keys.forEach(change => {
    //       // 변경된 항목의 인덱스를 찾습니다.
    //       const index = change.key;
    //       // 변경된 TextInputProps 객체를 가져옵니다.
    //       const updatedTextInput = yTextRef.current.get(index);
    //       // 해당 index의 textarea 요소를 찾습니다.
    //       const textareaElement = document.getElementById(`textarea-${index}`);
    //       if (textareaElement) {
    //         // textarea의 내용을 업데이트합니다.
    //         textareaElement.value = updatedTextInput.init;
    //       }
    //     });
    //   });




    // textArea.addEventListener('keydown', function(e) {
    //     const updatedTextInputs = textInputs.map((input, i) =>
    //      //i === item ? { ...input, init: textArea.value, textbox: { id: `textarea-${i}`, textarea: textArea } } : input
    //     i === item ? { ...input, init: textArea.value } : input
    //     );
       
    //     console.log("!!!!!!!!")
    //     //console.log(nowupdateInput);
    //     console.log("!!e is:")
    //     console.log(e);
    //     //console.log(e.target);
    //     //console.log(updatedTextInputs)          //test
    //     console.log("!!textareaid is:")
    //     console.log(textArea.id);        //etst
    //     console.log(textArea);

    //     setTextInputs(updatedTextInputs);
    //     yTextRef.current.delete(item, 1);
    //     yTextRef.current.insert(item, [{ ...updatedTextInputs[item] }]);
    //     textArea.value = updatedTextInputs[item].init;
    //     console.log("!!!targetAreavalue is:")
    //     console.log(textArea.value);
        
    //     if (e.key === 'Enter' && !e.shiftKey) {
    //         textArea.parentNode?.removeChild(textArea);
    //         now_text.show();
    //     }
    // });


    //console.log("ytextref")
    //console.log( yTextRef.current);
    /*
    yTextRef.current.find("").observe(() => {
        textArea.value = ""
    });
    */
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
               
              //onClick={(e) => handleOnClick(e, i)}
              onDblClick={(e) => handleDbClick(e, i)}
            />
        
        </React.Fragment>
      ))}

      {textareaValues.map((_textareaValues, i) => {
        <React.Fragment key={i}>
            <Rect 
            
            />
        </React.Fragment>
      })}
      
    </>
  );

};

export default TextEditor;
