addContract(contract) {
  // Проверяем, что контракт является экземпляром класса SmartContract
  if (!(contract instanceof SmartContract)) {
    throw new Error('Only instances of SmartContract can be added to the blockchain');
  }

  // Добавляем контракт в массив контрактов
  this.contracts.push(contract);

  // Добавляем код контракта в массив ожидающих транзакций
  const transaction = new Transaction(null, null, 0, contract.code);
  this.pendingTransactions.push(transaction);

  console.log(`Smart contract with code "${contract.code}" added to the blockchain`);
}

executeContract(contractAddress, functionName, ...args) {
  // Находим контракт с указанным адресом
  const contract = this.contracts.find(c => c.address === contractAddress);
  if (!contract) {
    throw new Error(`Contract with address ${contractAddress} not found in the blockchain`);
  }

  // Получаем функцию контракта по имени
  const func = contract.functions[functionName];
  if (!func) {
    throw new Error(`Function "${functionName}" not found in contract with address ${contractAddress}`);
  }

  // Выполняем функцию смарт-контракта
  const result = func.call(...args);

  // Создаем транзакцию с результатом выполнения контракта
  const transaction = new Transaction(null, contractAddress, 0, JSON.stringify(result));
  this.pendingTransactions.push(transaction);

  console.log(`Function "${functionName}" of contract with address ${contractAddress} executed, result: ${JSON.stringify(result)}`);
}

// Метод executeContract может быть вызван любым участником блокчейна, который имеет право на вызов функций данного смарт-контракта. Для вызова этого метода необходимо знать адрес смарт-контракта и имя функции, которую необходимо выполнить, а также передать все необходимые параметры функции.

// Вызов метода executeContract обычно происходит путем отправки транзакции на смарт-контракт, содержащей информацию о вызываемой функции и ее параметрах. Когда транзакция попадает в пул транзакций узла, он проверяет ее подпись и подлинность, а затем добавляет ее в пендинг-транзакции.

// Далее, когда майнер создает новый блок, он может вызвать метод minePendingTransactions у блокчейна, чтобы создать новый блок, который будет содержать эти транзакции. Когда блок создан и добавлен в блокчейн, все участники сети будут уведомлены об этом и смарт-контракт будет выполнен.

// Таким образом, метод executeContract может быть вызван любым участником блокчейна, который имеет право на вызов функций смарт-контракта. Когда вызов происходит, он создает транзакцию, которая будет включена в следующий блок, и когда блок будет добавлен в блокчейн, смарт-контракт будет выполнен.


