<!DOCTYPE html>
<html style='height:100%;'>
    <head>
        <meta http-equiv="refresh" content="5">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            td{
                font-family:Arial, Helvetica, sans-serif;
                background-color: lightcyan;
                border-style:Solid;
            }
            .time{
                text-align: right;
                padding-right: 1%;
            }
        </style>
    </head>
    <body style='height:97%;'>
        <div align="right" style="z-index:100;position:absolute;right:10px;font-family:Arial, Helvetica, sans-serif;width:600px;">
            <h1 style="font-size: 6vmin;margin-top: 0px;margin-bottom: 10px">Nush Bus Timings</h1>
            <table style="border:1px solid;border-collapse:collapse;right:10px;">
                <tr>
                    <td style="border-width: 0px;background-color: palegreen;font-size:4vmin"> Seats Available</td>
                </tr>
                <tr>
                    <td style="border-width: 0px;background-color: #ffe44d;font-size:4vmin"> Standing Available</td>
                </tr>
                <tr>
                    <td style="border-width: 0px;background-color: #f5a3a3;font-size:4vmin"> Standing Limited</td>
                </tr>
            </table>
            <h1 style="font-size:5vmin">
                <?php
                date_default_timezone_set('Asia/Singapore');
                echo date('h:ia');
                ?>
            </h1>
        </div>
        <?php
		
		require 'config.php';
        
		$busstops = array("16991", "17191", "17129", "17121");
        $busstopsname = array("Front Gate", "Back Gate", "Back Gate Middle", "Back Gate Far");
        $ch = curl_init();
        curl_setopt_array($ch, array(
            CURLOPT_HTTPHEADER => array('AccountKey:'.ACCOUNT_KEY),
            CURLOPT_RETURNTRANSFER => true,
        ));
        $now = new DateTime();

        function reorder(&$a) {
            if (empty($a["NextBus"]["EstimatedArrival"])) {
                return;
            }
            $now = new DateTime();
            $diff = $now->diff(new DateTime($a["NextBus"]["EstimatedArrival"]));
            if ($diff->invert == 1) {
                $a["NextBus"]["EstimatedArrival"] = $a["NextBus2"]["EstimatedArrival"];
                $a["NextBus2"]["EstimatedArrival"] = $a["NextBus3"]["EstimatedArrival"];
                $a["NextBus3"]["EstimatedArrival"] = "";
                $a["NextBus"]["Load"] = $a["NextBus2"]["Load"];
                $a["NextBus2"]["Load"] = $a["NextBus3"]["Load"];
                $a["NextBus3"]["Load"] = "";
            }
        }

        function gettime($s) {
            if (empty($s)) {
                return "&nbsp&nbsp&nbsp--";
            }
            $now = new DateTime();
            $diff = $now->diff(new DateTime($s));
            return $diff->format("<big><big>%i</big></big>");
        }

        function getcolor($s) {
            if (empty($s)) {
                return "#E8E8E8";
            }
            if ($s == "SEA") {
                return "palegreen";
            }
            if ($s == "SDA") {
                return "#ffe44d";
            }
            if ($s == "LSD") {
                return "#f5a3a3";
            }
        }

        echo "<table border='1'; style='table-layout:fixed;width:100%;height:100%;border-collapse:collapse;'>";
        for ($i = 0; $i < count($busstops); $i++) {
            echo "<tr><td rowspan='4' style='width:21%;padding:2%'>" . $busstopsname[$i] . "</td>";
            curl_setopt($ch, CURLOPT_URL, "http://datamall2.mytransport.sg/ltaodataservice/BusArrivalv2?BusStopCode=" . $busstops[$i] . "&SST=True");
            $json = curl_exec($ch);
            $out = json_decode($json, true);
            for ($ii = 0; $ii < count($out['Services']); $ii++) {
                if (isset($_GET['show']) || ($out['Services'][$ii]["ServiceNo"] != '97e' && $out['Services'][$ii]["ServiceNo"] != '963R')) {
                    reorder($out['Services'][$ii]);
                    $diff = $now->diff(new DateTime($out['Services'][$ii]["NextBus"]["EstimatedArrival"]));
                    while ($out['Services'][$ii]["NextBus"]["EstimatedArrival"]!=""&&isset($_GET['cut']) && $diff->i < $_GET['cut'] && $i > 1) {
                        $out['Services'][$ii]["NextBus"]["EstimatedArrival"] = $out['Services'][$ii]["NextBus2"]["EstimatedArrival"];
                        $out['Services'][$ii]["NextBus2"]["EstimatedArrival"] = $out['Services'][$ii]["NextBus3"]["EstimatedArrival"];
                        $out['Services'][$ii]["NextBus3"]["EstimatedArrival"] = "";
                        $out['Services'][$ii]["NextBus"]["Load"] = $out['Services'][$ii]["NextBus2"]["Load"];
                        $out['Services'][$ii]["NextBus2"]["Load"] = $out['Services'][$ii]["NextBus3"]["Load"];
                        $out['Services'][$ii]["NextBus3"]["Load"] = "";
                        $diff = $now->diff(new DateTime($out['Services'][$ii]["NextBus"]["EstimatedArrival"]));
                    }
                    echo "<td style='border-width: 1px 1px 0px 1px;text-align:right;padding-right: 1%;'>" . $out['Services'][$ii]["ServiceNo"] . "</td>";
                }
            }
            echo "</tr><tr>";
            for ($ii = 0; $ii < count($out['Services']); $ii++) {
                if (isset($_GET['show']) || ($out['Services'][$ii]["ServiceNo"] != '97e' && $out['Services'][$ii]["ServiceNo"] != '963R')) {
                    echo "<td class='time' style='border-width: 0px 1px 0px 0px;background-color:" . getcolor($out['Services'][$ii]["NextBus"]["Load"]) . " '>" . gettime($out['Services'][$ii]["NextBus"]["EstimatedArrival"]) . "</td>";
                }
            }
            echo "</tr><tr>";
            for ($ii = 0; $ii < count($out['Services']); $ii++) {
                if (isset($_GET['show']) || ($out['Services'][$ii]["ServiceNo"] != '97e' && $out['Services'][$ii]["ServiceNo"] != '963R')) {
                    echo "<td class='time' style='border-width: 0px 1px 0px 0px;background-color:" . getcolor($out['Services'][$ii]["NextBus2"]["Load"]) . "'>" . gettime($out['Services'][$ii]["NextBus2"]["EstimatedArrival"]) . "</td>";
                }
            }
            echo "</tr><tr>";
            for ($ii = 0; $ii < count($out['Services']); $ii++) {
                if (isset($_GET['show']) || ($out['Services'][$ii]["ServiceNo"] != '97e' && $out['Services'][$ii]["ServiceNo"] != '963R')) {

                    echo "<td class='time' style='border-width: 0px 1px 1px 0px;background-color:" . getcolor($out['Services'][$ii]["NextBus3"]["Load"]) . "'>" . gettime($out['Services'][$ii]["NextBus3"]["EstimatedArrival"]) . "</td>";
                }
            }
            echo "</tr>";
            // echo var_dump($out);
        }
        curl_close($ch);
        echo "</table>";
        ?>
    </body>
</html>
<!--Wayne Tee-->
