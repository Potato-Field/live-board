// import React, { FC, useState, useRef, useEffect } from 'react';
// import * as Y from "yjs";



// interface InputData{
//   id: string;
//   value: string;
//   isEditing : boolean;
// }


// interface EditableTextProps {
//   initialText: string;
//   yDocRef: React.MutableRefObject<Y.Doc>;
// }

// const EditableText: FC<EditableTextProps> = ({ initialText, yDocRef}) => {
//   const [isEditing, setIsEditing] = useState(false);
//   const [text, setText] = useState(initialText);

//   const [inputDataArray, setInputDataArray] = useState<InputData[]>([]);
//   const inputDataRefs = useRef<Y.Array<InputData>>(yDocRef.current.getArray<InputData>('inputdata'));
 
  
//   useEffect(() => {
//     //inputarray 
//       inputDataRefs.current.observe(() => {
//       setInputDataArray(inputDataRefs.current.toArray());
//     });
//   }, []);
  
//   const addInput = () => {
//     const newId = `input - ${Date.now()}-${Math.random()}`
//     const newInputData = {
//       // id: `input - ${inputDataArray.length}`,
//       id: newId,
//       value: ''
//     };
//     setInputDataArray([...inputDataArray, newInputData]);
//     inputDataRefs.current.push([newInputData]);
//   }
  
//   const removeInput = (index : number) =>{
//     const filteredArray = inputDataArray.filter((_, i) => i !== index);
//     setInputDataArray(inputDataArray.filter((_, i) => i !== index));
//     inputDataRefs.current.delete(index, 1);
//   }

//   const handleInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) =>{
//    const updatedValue = event.target.value;

//    yDocRef.current.transact(() => {
//     const currentItem = inputDataRefs.current.get(index);
//     if(currentItem){
//       const updatedItem = {...currentItem, value: updatedValue};
//       inputDataRefs.current.delete(index, 1);
//       inputDataRefs.current.insert(index, [updatedItem]);
//     }
//    });

//    const updatedInputDataArray = inputDataArray.map((inputData, i) => {
//       if(i === index){
//         return {...inputData, value: updatedValue};
//       }
//       return inputData;
//    });
//    setInputDataArray(updatedInputDataArray);
//   }







//   return (
//     <div>
//       <div>
//         <button onClick={addInput}>add textbox</button>
//         {inputDataArray.map((inputData, index) => (
//           <div key={inputData.id}>
//             <input
//             id={inputData.id}
//             type='text'
//             value={inputData.value}
//             onChange={(e) => handleInputChange(index, e)} 
//             />
//             <button onClick={() => removeInput(index)}>Delete</button>
//           </div>
//         ))}
        
//       </div>
//     </div>
    
  
    
//     // <div onDoubleClick={handleDoubleClick}>
//     //   {inputDataArray.map((inputData, index) => (
//     //       <div key={inputData.id}>
//     //         <input
//     //         id={inputData.id}
//     //         type='text'
//     //         value={inputData.value}
//     //         onChange={(e) => handleInputChange(index, e)} 
//     //         />
//     //         <button onClick={() => removeInput(index)}>Delete</button>
//     //       </div>
//     //     ))}
//     //   {isEditing ? (
//     //     <input
//     //       type="text"
//     //       value={text}
//     //       onChange={handleChange}
//     //       onBlur={handleBlur}
//     //     />
//     //   ) : (
//     //     <span>{text}</span>
//     //   )}
//     // </div>
//   );
// };

// export default EditableText;