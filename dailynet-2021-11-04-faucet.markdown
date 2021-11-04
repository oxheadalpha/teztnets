---
layout: page
title: Dailynet Faucet
permalink: /dailynet-2021-11-04-faucet
---

This faucet is for `dailynet-2021-11-04` only. It will not work on other networks.

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

