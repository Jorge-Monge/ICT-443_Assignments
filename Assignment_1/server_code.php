<?php
   $servername = 'localhost:3306';
   $username = 'jorge_ict-443';
   $password = 'AbX**89246359114rxxM';  
   $db_name = 'ict-443';
   
   try {
    $conn = new PDO("mysql:host=$servername;dbname=$db_name", $username, $password);
    // set the PDO error mode to exception
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $connResult = 'Connected successfully'; 
    echo json_encode($connResult);
    }
catch(PDOException $e)
    {
    $connResult = 'Connection failed: ' . $e->getMessage();
    echo json_encode($connResult);
    }

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