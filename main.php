


<html>
<head>
     <link rel="stylesheet" type="text/css" href="style.css">
     <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js"></script>
     <script src="jquery-1.6.2.min.js"></script>
     <script src="game.js"></script>
</head>
<body>


<div id="leftWrapper">
    <div id="stats">
        HP: <span id="hp"></span> / <span id="maxhp"></span><br>
        Flowers: <span id="flowers">0</span><br>
        Steps Taken: <span id="steps">0</span><br>
        Stones Moved: <span id="stonesMoved">0</span><br>
    </div>

    <div id="instructions">
        Walk into stones to move them<br>
        Collect Flowers<br><br>

        "space" to jump<br>
        "w" to pull a stone up<br>
        "a" to pull a stone left<Br>
        "d" to pull a stone right<br>
        "s" to pull a stone down<br>
        "p" to plant a flower<br>

        <br><br>
        <button id="sound" onclick="turnSound()">Sound : OFF</button><br>
        <button id="debug" onclick="turnDebug()">Debug : OFF</button>
        <span id="msg"></span>
        <br />
        <span id="zmsg"></span>

        <br /><br />
        <span id="dead">YOU ARE DEEEEEEEEEEEEEEEEEADDD!</span>

    </div>
</div>

<div id="wrapper">
    <table id="main"></table>
</div>

<div id="rightWrapper">
  <textarea rows="25" cols="50" readonly id="textLog"></textarea>
</div>


</body>
</html>