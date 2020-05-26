const createMatrix = document.getElementById('create-matrix');
const matrix = document.getElementById('matrix');
const startCalculator = document.getElementById('start-calculator');

let column;
let row;
let server;
const matrix1 = [[1,1,0,0], [1,1,0,0], [0,0,1,1], [0,0,1,1]];
const accessFrequecy = [[10,20,30], [10,30,50], [10,20,10], [20,10,20]];

// const matrix1 = [[1,0,1,0], [0,1,1,0],[0,1,0,1],[0,0,1,1]];
// const accessFrequecy = [[15,20,10], [5,0,0], [25,25,25], [3,0,0]];
let useMatrix = [];
let accessFrequecyMatrix = [];

const createMatrixInput = (row, column, mode, matrix) => {
  let title = 'Use Matrix';
  let id = 'use-matrix';
  let columnTitle = 'A';
  if (mode === 'afm') {
    title = 'Access Frequecy Matrix';
    id = 'access-frequecy';
    columnTitle = 'S';
  }
  let table = `<h1>${title}</h1><table><thead>'<th></th>`;
  for (let i = 1; i <= column; i++) {
    table += `<th>${columnTitle}${i}</th>`;
  }
  table += '</thead><tbody>';
  for (let i = 1; i <= row; i++) {
    table += '<tr><td>q' + i + '</td>';
    for (let j = 1; j <= column; j++) {
      table += `<td><input type="number" id="${mode}${i}${j}" value=${matrix[i-1][j-1]}></td>`;
    }
    table += '</tr>';
  }
  table += '</tbody></table>';
  document.getElementById(id).innerHTML = table;
};

createMatrix.addEventListener('click', () => {
  row = parseInt(document.getElementById('row').value);
  column = parseInt(document.getElementById('column').value);
  server = parseInt(document.getElementById('server').value);
  createMatrixInput(row, column, 'um', matrix1);
  createMatrixInput(row, server, 'afm', accessFrequecy);
});

const getDataMatrix = (row, column, mode) => {
  const matrixInput = [];
  for (let i = 0; i < row; i++) {
    const inputRowArray = [];
    for (let j = 0; j < column; j++) {
      const value = parseInt(document.getElementById(`${mode}${i + 1}${j + 1}`).value);
      inputRowArray.push(value);
    }
    matrixInput.push(inputRowArray);
	}
	if(mode === 'um'){
		useMatrix = [...matrixInput];
	} else {
		accessFrequecyMatrix = [...matrixInput];
	}
  
};

const createMatrixZero = (row) => {
	let result = [];
	for(let i = 0; i< row; i++){
		const rowMatrix = [];
		for(let i = 0; i< row; i++){
			rowMatrix.push(0);
		}
		result.push(rowMatrix);
	}
	return result;
}

const createOrder = (num) => {
  const order = [];
  for(let i = 1; i<=num; i ++){
    order.push(i);
  }
  return order;
} 

const calculateaffinity = (useMatrix, accessFrequecyMatrix) => {
  const numberAttribute = useMatrix[0].length;
	const result = createMatrixZero(numberAttribute);
	const length = useMatrix.length;
	for (let i = 0; i < numberAttribute; i++){
			for (let j = 0; j < numberAttribute; j++){
					let queries = [];
					useMatrix.forEach((item,index) => {
							if(item[i] !== 0 && item[j] !== 0){
									queries.push(index);
							}
					});
					let total = 0;
					queries.forEach(query => {
						total += accessFrequecyMatrix[query].reduce((a, b) => a + b,0);
					})
					result[i][j] = total;
			}
  }
  const order = createOrder(numberAttribute);
	return {
    result: result,
    order: order
  };
}

const renderMatrix =  (matrix, id, title, order) => {
	let length = matrix[0].length;
  let table = `<h1>${title}</h1><table><thead><th></th>`;
  for (let i = 1; i <= length; i++) {
    table += `<th>A${order[i-1]}</th>`;
  }
  table += '</thead><tbody>';
  for (let i = 1; i <= length; i++) {
    table += '<tr><td>A' + order[i-1] + '</td>';
    for (let j = 1; j <= length; j++) {
      table += `<td>${matrix[i-1][j-1]}</td>`;
    }
    table += '</tr>';
  }
  table += '</tbody></table>';
  document.getElementById(id).innerHTML = table;
}

const bond = (array1, array2) => {
	let total = 0;
	let length = array1.length;
	for(let i = 0; i < length; i++){
			total += array1[i]*array2[i];
	}
	return total;
}

const calculatorClusteredAffinity = (affinity) => {
  const CA = [affinity[0], affinity[1]];
  affinity.unshift([0, 0, 0, 0]);
  const length = affinity.length;
  let matran = [1,2,3,4];
  const change = [];
  Loop1:
  for(let a = 3; a < length; a++){
    let max = -Infinity;
    let index = 0;
    Loop2:
    for (let i = 0; i < length; i++ ){
      let cont;
      if(i === (a-1)){
          cont = 2*bond(affinity[i], affinity[a]) 
                      + 2*bond(affinity[a], affinity[0]) 
                      - 2*bond(affinity[i],affinity[0]);
      } else if(i === a) {
          break Loop2;
      }else {
          cont = 2*bond(affinity[i], affinity[a]) 
                      + 2*bond(affinity[a], affinity[i+1]) 
                      - 2*bond(affinity[i],affinity[i+1]);
      }
      if(max <= cont){
          max = cont;
          index = i;
      }
    }
    let temp = matran[a - 1];
    matran[a - 1] = matran[index];
    matran[index] = temp
    change.push([a-1, index]);
    CA.splice(index, 0,affinity[a]);
    temp = affinity[a];
    affinity[a] = affinity[index+1];
    affinity[index+1] = temp;
  }
  change.forEach(a => {
    CA.forEach(a1 => {
        const temp = a1[a[0]];
        a1[a[0]] = a1[a[1]];
        a1[a[1]] = temp;
    })
  })
	return {
    CA: CA,
    order: matran
  }
}

const findAttributeOfQuery = (column, row, matrix) => {
  let listResult =[];
  for(let i = 0; i < row; i ++) {
      let result= [];
      for(let j = 0; j < column; j ++) {
          if(matrix[i][j] === 1){
            result.push(j+1)
          }
      }
      listResult.push(result);
  }
  return listResult;
}

const findTQBQ = (array, attributeOfQuery) => {
  const TQ = [];
  attributeOfQuery.forEach((q,i) => {
      if(q.length > array.length){
          return;
      }
      let op = q.every(element => array.indexOf(element) > -1);
      if(op){
          TQ.push(i+1);
      }
  })
  return TQ;
}

const calculateAccessFrequecy = (array, accessFrequecyMatrix) => {
  let total = 0;
  array.forEach(a => {
      total += accessFrequecyMatrix[a-1].reduce((total, num) => (total + num));
  })
  return total;
}

const findBestCase = (useMatrix, accessFrequecyMatrix, matrix) => {
  let content = '<h1>VF – ALgorithm</h1><ul>';
  const attributeOfQuery = findAttributeOfQuery(row, column, useMatrix);
  let max = - Infinity;
  let index = 0;
  let bestCase = [];
  for(let i = 0; i<matrix.length-1;i++){
    content += '<li><p>Case' + i + '</p>';
    let TA = matrix.slice(0,i+1);
    let BA = matrix.slice(i+1);
    let Q = [1,2,3,4];
    let OQ= [];
    const TQ = findTQBQ(TA, attributeOfQuery);
    const BQ = findTQBQ(BA, attributeOfQuery);
    content += '<p>TA= ' + TA + '/ TQ=' + (TQ.length > 0 ? TQ : 'empty') + '</p>';
    content += '<p>BA= ' + BA + '/ BQ=' + BQ + '</p>';
    const TqBq = TQ.concat(BQ);
    const CTQ = calculateAccessFrequecy(TQ, accessFrequecyMatrix);
    content += '<p>CTQ=' + calculateAccessFrequecy(TQ, accessFrequecyMatrix) + '</p>';
    const CBQ = calculateAccessFrequecy(BQ, accessFrequecyMatrix);
    content += '<p>CBQ=' + calculateAccessFrequecy(BQ, accessFrequecyMatrix) + '</p>';
    OQ = Q.filter(q => {
        for(let i = 0; i < TqBq.length; i++){
            if(q === TqBq[i]){
                return false;
            }
        }
        return true;
    })
    content += '<p>OQ= ' + OQ + '</p>';
    content += '<p>CBQ=' + calculateAccessFrequecy(OQ, accessFrequecyMatrix) + '</p>';

    let COQ = calculateAccessFrequecy(OQ, accessFrequecyMatrix);
    content += '<p><strong>z=' + `${CTQ}*${CBQ} - ${COQ}*${COQ} = `+ (CTQ*CBQ - COQ*COQ) + '</strong></p>';
    if(max < CTQ*CBQ - COQ*COQ) {
        max =  CTQ*CBQ - COQ*COQ;
        index = i;
        bestCase = [TA, BA];
    }
    content += '</li>';
  }
  content += '<p>Best Case = ' + `[${bestCase[0]}] and [${bestCase[1]}]`  + '</p></ul>';
  document.getElementById('best-case').innerHTML = content;
}

startCalculator.addEventListener('click', () => {
	getDataMatrix(row, column, 'um');
	getDataMatrix(row, server, 'afm');
	const affinity = calculateaffinity(useMatrix, accessFrequecyMatrix);
	renderMatrix(affinity.result, 'affinity-matrix', 'Affinity Matrix', affinity.order);
  const clusteredAffinityMatrix = calculatorClusteredAffinity(affinity.result);
  renderMatrix(clusteredAffinityMatrix.CA, 'clustered-matrix', 'Clustered Matrix', clusteredAffinityMatrix.order);
  findBestCase(useMatrix, accessFrequecyMatrix, clusteredAffinityMatrix.order);
});
