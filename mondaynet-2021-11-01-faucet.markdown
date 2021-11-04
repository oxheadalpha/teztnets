---
layout: page
title: Mondaynet Faucet
permalink: /mondaynet-2021-11-01-faucet
---

This faucet is for `mondaynet-2021-11-01` only. It will not work on other networks.

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

