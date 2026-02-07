function funcA() {
  return [
    { id: 1, name: "Joao", grades: [10, 10, 10], role: "default" },
    { id: 2, name: "Jose", grades: [], role: "admin" },
    { id: 3, name: "Filipe", grades: [0], role: "editor" },
    { id: 4, name: "", grades: [10, 8, 9], role: "default" },
    { id: 5, grades: [7, 8], role: "default" }
  ];
}

const alunos = funcA(); 

function funcB(a) {
  const result = [];
 

  
  
  for (const aluno of a) {
    const id = aluno.id; 
    let name = aluno.name; 
    const grades = aluno.grades; 
    const role = aluno.role; 
    const average = getAverage(grades);
    const status = (average >= 10) ? "Aprovado" : "Reprovado";
    const label = getLabel(role);

    if (aluno.name === ""){
        name = "Sem nome";
    
    }else if (aluno.name === null || aluno.name === undefined){
        name = "Anonimo"

    }

    result.push(
      `${id}) ${name} - média: ${average} - status: ${status} ${label}`
    );
  }

  return result;
}
function getAverage(values) {
  if (!values || values.length === 0){
  return 0;
  }
      
  let result = 0;

  for (const value of values){
    result += value;
  }

  return result / values.length;
}

function getLabel(string) {
  switch (string) {
    case "admin":
      return "[Acesso total]";
    case "editor":
      return "[Pode Editar]";

    default:
      return "[Acesso limitado]";
  }
}



function funcC(b) {
  for (const item of b) {
    console.log(item);
  }
}
const stringArray = funcB(alunos);
funcC(stringArray); 

