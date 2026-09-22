<?php


namespace App;


class Helpers
{
    public static function calculateCommision($amount, $discountFromAgent, $percentageCommision)
    {
        $discount = ($discountFromAgent / 100) * $amount;
        $calculatedCommision = ($amount - $discount) * (round($percentageCommision / 100, 2));

        return round($calculatedCommision, 2);
    }

    // Function to calculate commision from the given preventive data and user responsible of that commision (commision percentage)
    // public static function calculateCommision($percentageCommision, $amount, $shipping, $iva) {
    //     $calculatedCommision = 0;
    //     $calculatedCommision = ($percentageCommision / 100) * (($amount - $shipping * (1 + $iva / 100)) / (1 + $iva / 100));

    //     return $calculatedCommision;
    // }

}
