<!DOCTYPE html>
<html>
    <head>
        <title>Preventivo</title>
        <style>
            h4 {
                width: 100%;
                text-align: right;
                border-bottom: 1px solid #000;
                line-height: 0.1em;
                margin: 10px 0 20px;
            }

            h4 span {
                background: #fff;
                padding: 0 10px;
            }

            .img-container {
                text-align: center;
                display: block;
            }

            .flex-container {
                text-align: center;
                width: 100%;
            }

            .flex-container > div {
                display: inline-block;
                font-style: oblique;
                padding: 0.660rem;
                font-size: 11px;
            }

            .container {
                height: auto;
            }

            .heading {
                font-size: 15px;
                font-weight: bold;
            }

            .right {
                width: 250px;
                float: right;
            }

            .right > div {
                line-height: 20px;
            }

            .text-right {
                text-align: right;
            }

            .border-bottom {
                border-bottom: 1px solid black
            }

            .pd-t {
                padding-top: 8px;
            }

            .pd-b {
                padding-bottom: 8px;
            }

            .w-100 {
                width: 100px;
            }

            .page-break {
                page-break-after: always;
            }

        </style>
    </head>
    <body>
        <div class="row">
            <div class="img-container">
                <img src="{{ public_path() . $admin->image }}" style="max-height: 300px" alt="company logo"/>
            </div>
            <div class="flex-container">
                <div>{{ $admin->address }}</div>
                <div>tel. {{ $admin->phone_number }}</div>
                <div>{{ $admin->website }}</div>
                <div>{{ $admin->email }}</div>
                <div>P.Iva {{ $admin->p_iva }}</div>
            </div>
            <br/>
            <h4><span>Preventivo {{ $products[0]->preventive }} del {{ $date }}</span></h4>
            <div class="container heading">
                <div class="right">
                    <div>{{ $shop->name }}</div>
                    <div>{{ $shop->address }}</div>
                    <div>P.Iva {{ $shop->iva }}</div>
                    <div>tel. {{ $shop->phone }}</div>
                    <div>{{ $shop->email }}</div>
                </div>
                <div class="right">
                    <div style="margin-left: 180px;">Spett.le</div>
                </div>
            </div>
            <div style="height: 80px;">
            @if (isset($preventiveReference))
                <div class="heading" style="margin-top: 80px;">Riferimento: {{ $preventiveReference }}</div>
            @else
                <div class="heading" style="margin-top: 80px;">Riferimento: {{ $preventiveCreated->name }}</div>
            @endif
        </div>
            <?php
                $i = 0;
                $total = 0;
            ?>
            <table border="1" style="width: 100%">
                <thead>
                    <tr>
                        <th>Pos.</th>
                        <th></th>
                        <th>Descrizione</th>
                        <th>Prezzo Un.</th>
                        <th>Qtà</th>
                        <th>Totale</th>
                    </tr>
                </thead>
                <tbody align="center">
                    @foreach($products as $product)
                        <?php $i++ ?>
                        <tr>
                            <td>{{ $i }}.</td>
                            <td  style="width: 20%;">
                                <img src="{{ public_path() . $product->systemImage }}"
                                    style="width: 90%; padding: 0px 10px 0px 10px; max-height: 110px;"
                                >
                            </td>
                            <td align="left" style="line-height: 18px; padding: 7px 0 7px 7px; width: 37%;">
                                <br>
                                <label>Sistema : {{ $product->system }}</label>
                                <br/>
                                <label>Colore del sistema : {{ $product->systemColor}}</label>
                                <br/>
                                <label>Larghezza : {{ $product->width }} cm</label>
                                <br/>
                                <label>Altezza : {{ $product->height }} cm</label>
                                <br/>
                                <label>Materiale : {{ $product->curtain }}</label>
                                <br/>
                                <label>Colore del materiale : {{ $product->curtainColor}}</label>

                                @if($product->motor != null)
                                    <br/>
                                    <label>Motore : {{ $product->motor }}</label>
                                @endif

                                @if($product->telecomand != null)
                                    <br/>
                                    <label>Telecomando : {{ $product->telecomand }}</label>
                                @endif

                                @if($product->chain != null)
                                    <br/>
                                    <label>Catena : {{ $product->chain }}</label>
                                @endif
                            </td>
                            <td>{{ round($product->totalPrice, 2) }} €</td>
                            <td>{{ $product->quantity }}</td>
                            <td>{{ round($product->totalPrice * $product->quantity, 2) }} €</td>
                        </tr>
                        <?php $total += $product->totalPrice * $product->quantity ?>
                    @endforeach
                </tbody>
            </table>
            <br/>
            <br/>
            <div class="container">
             {{--    <div class="right text-right w-100">
                    <div>{{ $total = sprintf("%0.2f", round($total, 2)) }} €</div>
                    <div>{{ $discountOnTotal = sprintf("%0.2f", $total * round(($discount / 100), 2)) }} €</div>
                    <div>{{ $calcIvaOnTotal = sprintf("%0.2f", round($admin->iva / 100, 2) * ($discountOnTotal)) }} €</div>
                    <div>{{ $totaleImpinibile = sprintf("%0.2f", $discountOnTotal + $calcIvaOnTotal) }} €</div>
                    <div>{{ sprintf("%0.2f", $shipping) }} €</div>
                    <div class="pd-b">{{ $calcIvaShippingOnShipping = sprintf("%0.2f", round($shop->iva_shipping / 100, 2) * ($shipping)) }} €</div>
                    <div class="border-bottom"></div>
                    <div class="pd-t">{{ sprintf("%0.2f", round($totaleImpinibile + $calcIvaShippingOnShipping + $shipping, 2)) }} €</div>
                </div> --}}
                <div class="right text-right w-100">
                    <div>{{ $total = sprintf("%0.2f", round($total, 2)) }} €</div>
                    <div>{{ $discountOnTotal = sprintf("%0.2f", $total - $total * round(($discount / 100), 2)) }} €</div>
                    <div>{{ $calcIvaOnTotal = sprintf("%0.2f", round($adminIva / 100, 2) * ($discountOnTotal)) }} €</div>
                    <div>{{ $totaleImpinibile = sprintf("%0.2f", $discountOnTotal + $calcIvaOnTotal) }} €</div>
                    <div>{{ sprintf("%0.2f", $shop->shipping) }} €</div>
                    <div class="pd-b">{{ $calcIvaShippingOnShipping = sprintf("%0.2f", round($shop->iva_shipping / 100, 2) * ($shop->shipping)) }} €</div>
                    <div class="border-bottom"></div>
                    <div class="pd-t">{{ sprintf("%0.2f", round($totaleImpinibile + $calcIvaShippingOnShipping + $shop->shipping, 2)) }} €</div>
                </div>
                <div class="right">
                    <div>Totale Prodotti</div>
                    <div>Sconto {{ $discount + 0 }} %</div>
                    <div>Iva {{ $adminIva }} %</div>
                    <div>Totale Imponibile</div>
                    <div>Costi di imballo e transporto</div>
                    <div class="pd-b">Iva Spedizione {{ $shop->iva_shipping }} %</div>
                    <div class="border-bottom"></div>
                    <div class="pd-t">Totale</div>
                </div>
                <div class="page-break"></div>
                <div>{!! $footer !!}</div>
            </div>
        </div>
        <script type="text/php">
            if (isset($pdf)) {
                $font = $fontMetrics->get_font("helvetica", "bold");
                $pdf->page_text(35, 760, "Pag. {PAGE_NUM} di {PAGE_COUNT}", $font, 8, array(0,0,0));
            }
        </script>
    </body>
</html>

