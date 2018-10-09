<?
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
echo "hello";
echo "<table border='1'; style='table-layout:fixed;width:100%;height:100%;border-collapse:collapse;'>";
for ($i = 0; $i < count($busstops); $i++) {
  echo "<tr><td rowspan='4' style='width:21%;padding:2%'>" . $busstopsname[$i] . "</td>";
  curl_setopt($ch, CURLOPT_URL, "http://datamall2.mytransport.sg/ltaodataservice/BusArrivalv2?BusStopCode=" . $busstops[$i] . "&SST=True");
  $json = curl_exec($ch);
  $out = json_decode($json, true);
  echo gettype($out['Services']);
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
      echo "<tr><td rowspan='4' style='width:21%;padding:2%'>" . $busstopsname[$i] . "</td>"
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