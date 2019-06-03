<?php

   $servername = 'localhost:3306';
   $username = 'jorge_ict-443';
   $password = 'AbX**89246359114rxxM';  
   $db_name = 'ict-443';
   
   $connResult = array();

   // Mapping frontEndNames => realDatabaseNames
   $shoppingListTableMapping = array(
       'groceries' => 'shopping_list',
       'name' => 'grocery_itemname',
       'amount' => 'quantity',
       'amount_qualifier' => 'unit',
       'due' => 'due_date'
   );
   
   try {
    if ($_POST['functionName'] === 'connectToDb') {
        $conn = new PDO("mysql:host=$servername;dbname=$db_name", $username, $password);
    // set the PDO error mode to exception
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $connResult['result'] = 'Connected successfully'; 
    } else {

        $connResult['result'] = 'XXX Connected successfully'; 
    }
    }
catch(PDOException $e)
    {
        $connResult['result']  = 'Connection failed: ' . $e->getMessage();
    }

    echo json_encode($connResult);
    //echo json_encode(array("result" => "Hey, I am here"));
    

/*
$sql = 'SELECT grocery_itemname, quantity, unit, due_date FROM groceries';
foreach ($conn->query($sql) as $row) {
    print 'Item: ' . $row['grocery_itemname'] . "</br>";
    print 'Quantity: ' . $row['quantity'] . "</br>";
    print 'Unit: ' . $row['unit'] . "</br>";
    print 'Due date: ' . $row['due_date'] . "</br>";
}
*/
    
?>