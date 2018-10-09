<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="refresh" content="5">
    <style>
      * {
        box-sizing: border-box;
      }
      body,html{
        padding:0%;
        margin:0%;
        height:100%;
        font-size: 100%;
      }
      body{
      overflow:hidden;
      }
      #top{
        width:100%;
        position: absolute;
        top:0px;
        border-bottom-style: solid;
        height:8%;
      }
      .title{
        font-size: 270%;
        background-color:transparent;
        margin-top:25px !important;
        padding-left:10px;
        font-family: Helvetica;
      }
      #time{
        position: absolute;
        left:60%;
        width: 50%;
        text-align:center;
      }
      #mid{
        position: absolute;
        top:10%;
        width:100%;
        height:90%;
        margin: 0;
      }
      .stopName{
        font-size: 350%;
        padding-bottom: 10px;
        height: 6%;
        margin: 0;
        padding-bottom: 5px;
        font-family: Helvetica;
      }
      .stop{
        position:absolute;
        border-collapse: collapse;
      }
      .busNo{
        font-size: 400%;
        color: white;
        border-bottom-style: solid;
        font-family: Helvetica;
        text-align: center;
        background-color: #b30000;
        width: 20%;
      }
      .t1{
        font-size: 400%;
        border-right-style: solid;
        border-left-style: solid;
        font-family: Helvetica;
        text-align: center;
        border-bottom-style: solid;
        border-color: white;
        width: 18%;
      }
      .t2{
        font-size: 350%;
        font-family: Helvetica;
        text-align: center;
        border-bottom-style: solid;
        border-color: white;
        width: 12.5%;
      }
      td{
        overflow: hidden;
      }
      .m{
        font-size:70%;
      }
    </style>
  </head>
  <body>
    <?php

    require 'config.php';

    $busstops = array("16991", "17191", "17129", "17121");
    $busstopsname = array("Front Gate", "Back Gate", "Back Gate Middle", "Back Gate Far");
    $ch = curl_init();
    curl_setopt_array($ch, array(
      CURLOPT_HTTPHEADER => array('AccountKey:'.ACCOUNT_KEY),
      CURLOPT_RETURNTRANSFER => true,
    ));

    for ($i = 0; $i < count($busstops); $i++) {
      curl_setopt($ch, CURLOPT_URL, "http://datamall2.mytransport.sg/ltaodataservice/BusArrivalv2?BusStopCode=" . $busstops[$i] . "&SST=True");
      $current_time = time();
      $expire_time = 60;
      $file = $i."cache";
      $file_time = filemtime($file);
      if (file_exists($file) && ($current_time - $expire_time < $file_time)) {
        $json = file_get_contents($file);
      } else {
        $json = curl_exec($ch);
        file_put_contents($file, $json);
      }
       // var_dump($json);
      $out[$i] = json_decode($json, true);
    }
    curl_close($ch);

    function getMins($s) {
      $n = strtotime($s);
      date_default_timezone_set("Asia/Singapore");
      $now = date("U");
      if (empty($s)) {
        return "--";
      }
      if (($n - $now) > 60) {
        return (string) (floor(($n - $now) / 60));
      }
      if (($n - $now) < 60) {
        return "Arr";
      } else {
        return "--";
      }
    }

    function getColor($s) {
      if (empty($s)) {
        return "LightCyan";
      }
      if ($s == "SEA") {
        return "#99ff99";
      }
      if ($s == "SDA") {
        return "#ffff99";
      }
      if ($s == "LSD") {
        return "#ff9999";
      }
    }

    function disRow($data, $i, $n) {
      echo "<td class='busNo'>" . $data[$i]['ServiceNo'] . "
              </td>
              <td class='t1' style=' background-color: " . getColor($data[$i]['NextBus']['Load']) . "'>
              " . getMins($data[$i]['NextBus']['EstimatedArrival']);
      if (getMins($data[$i]['NextBus']['EstimatedArrival']) != 'Arr') {
        echo "<span class='m'>m</span>
              </td>";
      } else {
        echo "</td>";
      }
      echo "<td class='t2' style=' background-color: " . getColor($data[$i]['NextBus2']['Load']) . "'>
              " . getMins($data[$i]['NextBus2']['EstimatedArrival']);
      if (getMins($data[$i]['NextBus2']['EstimatedArrival']) != 'Arr') {
        echo "<span class='m'>m</span>
              </td>";
      } else {
        echo "</td>";
      }
    }

    function cleanUp($data) {
      $newData = array();
      for ($i = 0; $i < count($data); $i++) {
        if ($data[$i]["ServiceNo"] != "963R" && $data[$i]["ServiceNo"] != "97e") {
          array_push($newData, $data[$i]);
        }
      }
      return $newData;
    }

    function display($data, $n) {
      $busstopsname = array("Front Gate", "Back Gate", "Back Gate Middle", "Back Gate Far");
      $stopnameheight = array("9%", "21.5%", "50.5%", "71.5%");
      $tableheight = array("14.5%", "27%", "56.5%", "77.5%");
      if ($n <= 1) {
        echo"
            <p class='stopName' style='width:50%; position: absolute; top:" . $stopnameheight[$n] . ";'>
            " . $busstopsname[$n] . "</p>
            <table class='stop' style='width: 49%; top: " . $tableheight[$n] . "';'>
            ";
        for ($i = 0; $i < count($data); $i++) {
          echo"<tr>
                "
          . disRow($data, $i, $n) .
          "
                </tr>";
        }
        echo"
          </table>
          ";
      } else {
        echo"
            <p class='stopName' style='width:100%; position: absolute; top:" . $stopnameheight[$n] . "'>
            " . $busstopsname[$n] . "</p>
            <table class='stop' style='width:100%; position: absolute; top:" . $tableheight[$n] . "'>
            ";
        for ($i = 0; $i < (count($data) / 2); $i++) {
          echo "<tr>";
          disRow($data, 2 * $i, $n);
          echo "<td style='width: 5%;'></td>";
          disRow($data, (2 * $i) + 1, $n);
          echo"</tr>";
        }
        echo"
            </table>
            ";
      }
    }
    ?>
    <div id="top">
      <p class="title"> NUSH Bus Timings
        <span id="time">
          <?php
          date_default_timezone_set("Asia/Singapore");
          echo date("h:ia");
          ?>
        </span>
      </p>
    </div>
    <table style="position: absolute; top: 19%; right: 3%; border-style: solid; border-color: black;">
      <tr>
        <td style="text-align: left;padding:5px;border-width: 0px;background-color: #99ff99;font-size: 200%; font-family: Helvetica;"> Seats Available</td>
      </tr>
      <tr>
        <td style="text-align: left;padding:5px;border-width: 0px;background-color: #ffff99; font-size: 200%; font-family: Helvetica;"> Standing Available</td>
      </tr>
      <tr>
        <td style="text-align: left;padding:5px;border-width: 0px;background-color: #ff9999; font-size: 200%; font-family: Helvetica;"> Standing Limited</td>
      </tr>
    </table>
    <?php
    for ($i = 0; $i < count($busstops); $i++) {
      display(cleanUp($out[$i]['Services']), $i);
    }
    ?>
  </body>
</html>
