---
layout: page
title: Granadanet Faucet
permalink: /granadanet-faucet
---

This faucet is for `granadanet` only. It will not work on other networks.

Please use responsibly as the number of addresses is limited. For special requests, contact us.

<script src='https://www.google.com/recaptcha/api.js'/>
<script>
function captchaDone(response) { $("#gettz").prop('disabled',false); $("#gettz").addClass('btn-b');
function submited() { $("#gettz").prop('disabled',true); $("#gettz").removeClass('btn-b');
</script>


<form method='POST' action='.' onsubmit="submited()">
    <div>
        <button id="gettz" style='display: block; margin: 0 auto; width: 304px;' disabled=true>Get Testnet ꜩ</button>
        <br/>
        <div class="g-recaptcha" data-sitekey="6LcARlgbAAAAAHfqADFawmaQ5U4dceyrdMi1Rtpj" data-callback="captchaDone"></div>
    </div>
</form>

