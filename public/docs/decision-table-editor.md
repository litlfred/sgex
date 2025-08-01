# Decision Table Editor Requirements

## Overview
This tool enables structured authoring and editing of decision tables for use in digital health guidelines, particularly for generating Decision Model and Notation (DMN) files with embedded Clinical Quality Language (CQL). It allows users to define decision logic, manage rule inputs and outputs, and attach guidance and annotations in a structured format.

## Core Features

### Table Structure
Each decision table consists of:
- **Inputs**: One or more named columns representing conditions.
- **Output**: A single named column representing the decision outcome.
- **Guidance**: Optional column providing human-readable instructions per rule.
- **Annotations**: Optional column for supplementary notes or comments.
- **Metadata**: Decision table-level metadata such as `id`, `name`, `trigger`, and `businessRule`.

Each row in the table represents a **rule**, with cell values corresponding to logical expressions.

### Example Input Table (Structured BCG Schedule Table)

<table border="1" cellspacing="0" cellpadding="4">
<tr>
<td style="background-color: #002060;">Decision ID</td>
<td style="background-color: #002060;">IMMZ.D2.DT.BCG</td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td style="background-color: #002060;">Business rule</td>
<td style="background-color: #002060;">Determine if the client is due for a bacille Calmetteâ€“GuÃ©rin (BCG) vaccination according to the national immunization schedule</td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td style="background-color: #002060;">Trigger</td>
<td style="background-color: #002060;">IMMZ.D2 Determine required vaccination(s) if any</td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td style="background-color: #D9E2F3;">Inputs</td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td style="background-color: #D9EAD3;">Output</td>
<td>Guidance displayed to health worker</td>
<td style="background-color: #EAD1DC;">Annotations</td>
<td style="background-color: #002060;">Reference(s)</td>
</tr>
<tr>
<td style="background-color: #D9E2F3;">Number of BCG primary series doses administered<br>Count of vaccines administered (where "Vaccine type" = "BCG vaccines" and "Type of dose" = "Primary series")</td>
<td style="background-color: #FFFF00;">Age<br>Today's date âˆ’ "Date of birth"</td>
<td style="background-color: #FFFF00;">HIV status</td>
<td style="background-color: #FFFF00;">Currently on ART</td>
<td style="background-color: #FFFF00;">Immunologically stable</td>
<td style="background-color: #FFFF00;">TB infection test result</td>
<td style="background-color: #D9E2F3;">Time passed since a live vaccine was administered<br>Today's date âˆ’ latest "Date and time of vaccination" (where "Live vaccine" = TRUE)</td>
<td style="background-color: #FFFF00;">Clinically well</td>
<td style="background-color: #D9EAD3;"></td>
<td></td>
<td style="background-color: #EAD1DC;"></td>
<td style="background-color: #002060;"></td>
</tr>
<tr>
<td>No BCG primary series dose was administered<br>Count of vaccines administered (where "Vaccine type" = "BCG vaccines" and "Type of dose" = "Primary series") = 0</td>
<td>Client's age is less than or equal to 28 days<br>Today's date âˆ’ "Date of birth" â‰¤ 28 days</td>
<td>Client's HIV status is negative or unknown<br>"HIV status" â‰  "HIV-positive"</td>
<td>â€“</td>
<td>â€“</td>
<td>â€“</td>
<td>No live vaccine was administered<br>Today's date âˆ’ latest "Date and time of vaccination" (where "Live vaccine" = TRUE) IS NULL</td>
<td>â€“</td>
<td>Client is due for BCG vaccination<br>"Immunization recommendation status" = "Due"</td>
<td>Should vaccinate client with first BCG dose as no BCG dose was administered, client is within age range, HIV status is not positive and no live vaccine was administered.<br>Check for contraindications.</td>
<td>Neonates born to women of unknown HIV status should be vaccinated as the benefits of BCG vaccination outweigh the risks. Neonates of unknown HIV status born to HIV-infected women should be vaccinated if they have no clinical evidence suggestive of HIV infection.</td>
<td>WHO recommendations for routine immunization â€“ summary tables (March 2023) (1)</td>
</tr>
<tr>
<td></td>
<td></td>
<td></td>
<td>â€“</td>
<td>â€“</td>
<td>â€“</td>
<td>Live vaccine was administered in the last four weeks<br>Today's date âˆ’ latest "Date and time of vaccination" (where "Live vaccine" = TRUE) < 4 weeks</td>
<td>â€“</td>
<td>Client is not due for BCG vaccination<br>"Immunization recommendation status" = "Not due"</td>
<td>Should not vaccinate client with first BCG dose as live vaccine was administered in the last 4 weeks.<br>Check for any vaccines due and inform the caregiver of when to come back for the first BCG dose.</td>
<td></td>
<td></td>
</tr>
<tr>
<td></td>
<td></td>
<td>Client's HIV status is positive<br>"HIV status" = "HIV-positive"</td>
<td>Client is currently receiving antiretroviral therapy<br>"Currently on ART" = TRUE</td>
<td>Client is immunologically stable<br>"Immunologically stable" = TRUE</td>
<td>â€“</td>
<td>No live vaccine was administered<br>Today's date âˆ’ latest "Date and time of vaccination" (where "Live vaccine" = TRUE) IS NULL</td>
<td>â€“</td>
<td>Client is due for BCG vaccination<br>"Immunization recommendation status" = "Due"</td>
<td>Should vaccinate client with first BCG dose as no BCG dose was administered, client is immunologically stable and no live vaccine was administered.<br>Check for contraindications.</td>
<td>For neonates with HIV infection confirmed by early virological testing, BCG vaccination should be delayed until ART has been started and the infant confirmed to be immunologically stable (CD4 > 25%).<br>Moderate-to-late preterm infants (gestational age > 31 weeks) and low-birth-weight infants (< 2500 g) who are healthy and clinically stable can receive BCG vaccination at birth, or at the latest, upon discharge.</td>
<td></td>
</tr>
<tr>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td>â€“</td>
<td>Live vaccine was administered in the last four weeks<br>Today's date âˆ’ latest "Date and time of vaccination" (where "Live vaccine" = TRUE) < 4 weeks</td>
<td>â€“</td>
<td>Client is not due for BCG vaccination<br>"Immunization recommendation status" = "Not due"</td>
<td>Should not vaccinate client with first BCG dose as live vaccine was administered in the last 4 weeks.<br>Check for any vaccines due and inform the caregiver of when to come back for the first BCG dose.</td>
<td></td>
<td></td>
</tr>
<tr>
<td></td>
<td></td>
<td></td>
<td></td>
<td>Client is not immunologically stable<br>"Immunologically stable" = FALSE</td>
<td>â€“</td>
<td>â€“</td>
<td>â€“</td>
<td>Client is not due for BCG vaccination<br>"Immunization recommendation status" = "Not due"</td>
<td>Should not vaccinate client with first BCG dose as client is not immunologically stable.<br>Check for any vaccines due and inform the caregiver of when to come back for the first BCG dose.</td>
<td>For neonates with HIV infection confirmed by early virological testing, BCG vaccination should be delayed until ART has been started and the infant confirmed to be immunologically stable (CD4 > 25%).</td>
<td></td>
</tr>
<tr>
<td></td>
<td></td>
<td></td>
<td>Client is currently not receiving antiretroviral therapy<br>"Currently on ART" = FALSE</td>
<td>â€“</td>
<td>â€“</td>
<td>â€“</td>
<td>â€“</td>
<td>Client is not due for BCG vaccination<br>"Immunization recommendation status" = "Not due"</td>
<td>Should not vaccinate client with first BCG dose as ART has not been started.<br>Check for any vaccines due and inform the caregiver of when to come back for the first BCG dose.</td>
<td></td>
<td></td>
</tr>
<tr>
<td></td>
<td>Client's age is between 28 days and 5 years<br>28 days < Today's date âˆ’ "Date of birth" < 5 years</td>
<td>Client's HIV status is negative or unknown<br>"HIV status" â‰  "HIV-positive"</td>
<td>â€“</td>
<td>â€“</td>
<td>Client's TB infection test result is negative<br>"TB infection test result" = "Negative"</td>
<td>No live vaccine was administered in the last four weeks<br>Today's date âˆ’ latest "Date and time of vaccination" (where "Live vaccine" = TRUE) â‰¥ 4 weeks</td>
<td>â€“</td>
<td>Client is due for BCG vaccination<br>"Immunization recommendation status" = "Due"</td>
<td>Should vaccinate client with first BCG dose as no BCG dose was administered, client's TB test result is negative and no live vaccine was administered in the past 4 weeks.<br>Check for contraindications.</td>
<td>BCG vaccination is also recommended for unvaccinated older children negative for tuberculin skin test (TST) or interferon-gamma release assay (IGRA) who are in settings with high incidence of TB and/or high leprosy burden or those moving from low-to-high TB incidence/leprosy burden settings.</td>
<td></td>
</tr>
<tr>
<td></td>
<td></td>
<td></td>
<td>â€“</td>
<td>â€“</td>
<td></td>
<td>Live vaccine was administered in the last four weeks<br>Today's date âˆ’ latest "Date and time of vaccination" (where "Live vaccine" = TRUE) < 4 weeks</td>
<td>â€“</td>
<td>Client is not due for BCG vaccination<br>"Immunization recommendation status" = "Not due"</td>
<td>Should not vaccinate client with first BCG dose as live vaccine was administered in the past 4 weeks.<br>Check for any vaccines due and inform the caregiver of when to come back for the first dose.</td>
<td></td>
<td></td>
</tr>
<tr>
<td></td>
<td></td>
<td></td>
<td>â€“</td>
<td>â€“</td>
<td>Client's TB infection test result is unknown (test not done or no result yet)<br>"TB infection test result" IS NULL</td>
<td>â€“</td>
<td>â€“</td>
<td>Clinical judgement is required. Create clinical note.<br>"Immunization recommendation status" = "Further evaluation needed"</td>
<td>Recommend the client to perform TB infection testing.<br>Re-evaluate client once the test result is available.</td>
<td></td>
<td></td>
</tr>
<tr>
<td></td>
<td></td>
<td></td>
<td>â€“</td>
<td>â€“</td>
<td>Client's TB infection test result is positive<br>"TB infection test result" = "Positive"</td>
<td>â€“</td>
<td>â€“</td>
<td>Client is not due for BCG vaccination<br>"Immunization recommendation status" = "Not due"</td>
<td>Should not vaccinate client with first BCG dose as client's TB infection test result is positive. Consider evaluating for TB disease or for TB preventive treatment (TPT) eligibility (once TB disease is ruled out).</td>
<td></td>
<td></td>
</tr>
<tr>
<td></td>
<td></td>
<td>Client's HIV status is positive<br>"HIV status" = "HIV-positive"</td>
<td>Client is currently receiving antiretroviral therapy<br>"Currently on ART" = TRUE</td>
<td>Client is not immunologically stable<br>"Immunologically stable" = FALSE</td>
<td>â€“</td>
<td>â€“</td>
<td>â€“</td>
<td>Client is not due for BCG vaccination<br>"Immunization recommendation status" = "Not due"</td>
<td>Should not vaccinate client with first BCG dose as client is not immunologically stable.<br>Check for any vaccines due, and inform the caregiver of when to come back for the first BCG dose.</td>
<td>If children infected with HIV are receiving ART and are clinically well and immunologically stable (CD4% > 25% for children aged under 5 years), they should be vaccinated with BCG.</td>
<td></td>
</tr>
<tr>
<td></td>
<td></td>
<td></td>
<td></td>
<td>â€“</td>
<td>â€“</td>
<td>â€“</td>
<td>Client is not clinically well<br>"Clinically well" = FALSE</td>
<td>Client is not due for BCG vaccination<br>"Immunization recommendation status" = "Not due"</td>
<td>Should not vaccinate client with first BCG dose as client is not clinically well.<br>Check for any vaccines due, and inform the caregiver of when to come back for the first BCG dose.</td>
<td></td>
<td></td>
</tr>
<tr>
<td></td>
<td></td>
<td></td>
<td></td>
<td>Client is immunologically stable<br>"Immunologically stable" = TRUE</td>
<td>â€“</td>
<td>No live vaccine was administered in the last four weeks<br>Today's date âˆ’ latest "Date and time of vaccination" (where "Live vaccine" = TRUE) â‰¥ 4 weeks</td>
<td>Client is clinically well<br>"Clinically well" = TRUE</td>
<td>Client is due for BCG vaccination<br>"Immunization recommendation status" = "Due"</td>
<td>Should vaccinate client with first BCG dose as no BCG dose was administered, client is receiving ART, clinically well and immunologically stable. No live vaccine was administered in the last 4 weeks.<br>Check for contraindications.</td>
<td></td>
<td></td>
</tr>
<tr>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td>â€“</td>
<td>Live vaccine was administered in the last four weeks<br>Today's date âˆ’ latest "Date and time of vaccination" (where "Live vaccine" = TRUE) < 4 weeks</td>
<td></td>
<td>Client is not due for BCG vaccination<br>"Immunization recommendation status" = "Not due"</td>
<td>Should not vaccinate client with first BCG dose as live vaccine was administered in the past 4 weeks.<br>Check for any vaccines due and inform the caregiver of when to come back for the first BCG dose.</td>
<td></td>
<td></td>
</tr>
<tr>
<td></td>
<td></td>
<td></td>
<td>Client is currently not receiving antiretroviral therapy<br>"Currently on ART" = FALSE</td>
<td>â€“</td>
<td>â€“</td>
<td>â€“</td>
<td>â€“</td>
<td>Client is not due for BCG vaccination<br>"Immunization recommendation status" = "Not due"</td>
<td>Should not vaccinate client with first BCG dose as client is not currently receiving ART.<br>Check for any vaccines due and inform the caregiver of when to come back for the first BCG dose.</td>
<td></td>
<td></td>
</tr>
</table>

### Example Output (DMN XML Extract for BCG Schedule)

<pre><code class="language-xml">
<dmn:definitions xmlns:dmn="https://www.omg.org/spec/DMN/20240513/MODEL/" namespace="http://smart.who.int/immunizations" label="IMMZ.D2 Determine required vaccination(s) if any" id="DAK.DT.IMMZ.D2.DT.BCG">
  <dmn:decision id="DAK.DT.IMMZ.D2.DT.BCG" label="IMMZ.D2 Determine required vaccination(s) if any">
    <dmn:question>IMMZ.D2 Determine required vaccination(s) if any</dmn:question>
    <dmn:usingTask href="http://smart.who.int/immunizations/bpmn/Determine.bpmn#if%20the%20client%20is%20due%20for%20a%20bacille%20Calmette%E2%80%93Gu%C3%A9rin%20%28BCG%29%20vaccination%20according%20to%20the%20national%20immunization%20schedule"/>
    <dmn:decisionTable id="DAK.DT.IMMZ.D2.DT.BCG">
      <dmn:input id="input.DAK.DT.IMMZ.D2.DT.BCG.NumberofBCGprimaryseriesdosesadministered" label="Number of BCG primary series doses administered">
        <dmn:inputExpression id="inputExpression.DAK.DT.IMMZ.D2.DT.BCG.NumberofBCGprimaryseriesdosesadministered" typeRef="string">
          <dmn:text>Count of vaccines administered (where "Vaccine type" = "BCG vaccines" and "Type of dose" = "Primary series")</dmn:text>
        </dmn:inputExpression>
      </dmn:input>
      <dmn:input id="input.DAK.DT.IMMZ.D2.DT.BCG.Age" label="Age">
        <dmn:inputExpression id="inputExpression.DAK.DT.IMMZ.D2.DT.BCG.Age" typeRef="string">
          <dmn:text>Today's date âˆ’ "Date of birth"</dmn:text>
        </dmn:inputExpression>
      </dmn:input>
      <dmn:input id="input.DAK.DT.IMMZ.D2.DT.BCG.HIVstatus" label="HIV status">
        <dmn:inputExpression id="inputExpression.DAK.DT.IMMZ.D2.DT.BCG.HIVstatus" typeRef="string">
          <dmn:text>HIV status</dmn:text>
        </dmn:inputExpression>
      </dmn:input>
      <dmn:input id="input.DAK.DT.IMMZ.D2.DT.BCG.CurrentlyonART" label="Currently on ART">
        <dmn:inputExpression id="inputExpression.DAK.DT.IMMZ.D2.DT.BCG.CurrentlyonART" typeRef="string">
          <dmn:text>Currently on ART</dmn:text>
        </dmn:inputExpression>
      </dmn:input>
      <dmn:input id="input.DAK.DT.IMMZ.D2.DT.BCG.Immunologicallystable" label="Immunologically stable">
        <dmn:inputExpression id="inputExpression.DAK.DT.IMMZ.D2.DT.BCG.Immunologicallystable" typeRef="string">
          <dmn:text>Immunologically stable</dmn:text>
        </dmn:inputExpression>
      </dmn:input>
      <dmn:input id="input.DAK.DT.IMMZ.D2.DT.BCG.TBinfectiontestresult" label="TB infection test result">
        <dmn:inputExpression id="inputExpression.DAK.DT.IMMZ.D2.DT.BCG.TBinfectiontestresult" typeRef="string">
          <dmn:text>TB infection test result</dmn:text>
        </dmn:inputExpression>
      </dmn:input>
      <dmn:input id="input.DAK.DT.IMMZ.D2.DT.BCG.Timepassedsincealivevaccinewasadministered" label="Time passed since a live vaccine was administered">
        <dmn:inputExpression id="inputExpression.DAK.DT.IMMZ.D2.DT.BCG.Timepassedsincealivevaccinewasadministered" typeRef="string">
          <dmn:text>Today's date âˆ’ latest "Date and time of vaccination" (where "Live vaccine" = TRUE)</dmn:text>
        </dmn:inputExpression>
      </dmn:input>
      <dmn:input id="input.DAK.DT.IMMZ.D2.DT.BCG.Clinicallywell" label="Clinically well">
        <dmn:inputExpression id="inputExpression.DAK.DT.IMMZ.D2.DT.BCG.Clinicallywell" typeRef="string">
          <dmn:text>Clinically well</dmn:text>
        </dmn:inputExpression>
      </dmn:input>
      <dmn:output id="output.DAK.DT.IMMZ.D2.DT.BCG.CarePlan" label="Care Plan">
        <dmn:description>Produce a suggested Care Plan for consideration by health worker</dmn:description>
      </dmn:output>
      <dmn:output id="output.DAK.DT.IMMZ.D2.DT.BCG.Guidancedisplayedtohealthworker" label="Guidance displayed to health worker">
        <dmn:description>Request to communicate guidance to the health worker</dmn:description>
      </dmn:output>
      <dmn:output id="output.DAK.DT.IMMZ.D2.DT.BCG.Annotations" label="Annotations">
        <dmn:description>Additional information for the health worker</dmn:description>
      </dmn:output>
      <dmn:output id="output.DAK.DT.IMMZ.D2.DT.BCG.References" label="Reference(s)">
        <dmn:description>Reference for the source content (L1)</dmn:description>
      </dmn:output>
      <dmn:rule id="rule.DAK.DT.IMMZ.D2.DT.BCG.rule.NoBCGprimaryseries4747864bda">
        <dmn:inputEntry>
          <dmn:description>Count of vaccines administered (where "Vaccine type" = "BCG vaccines" and "Type of dose" = "Primary series") = 0</dmn:description>
          <dmn:text>No BCG primary series dose was administered</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>Today's date âˆ’ "Date of birth" â‰¤ 28 days</dmn:description>
          <dmn:text>Clients age is less than or equal to 28 days</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"HIV status" â‰  "HIV-positive"</dmn:description>
          <dmn:text>Clients HIV status is negative or unknown</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>Today's date âˆ’ latest "Date and time of vaccination" (where "Live vaccine" = TRUE) IS NULL</dmn:description>
          <dmn:text>No live vaccine was administered</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry>
          <dmn:description>"Immunization recommendation status" = "Due"</dmn:description>
          <dmn:text>Client is due for BCG vaccination</dmn:text>
        </dmn:outputEntry>
        <dmn:outputEntry>
          <dmn:description>Check for contraindications.</dmn:description>
          <dmn:text>Should vaccinate client with first BCG dose as no BCG dose was administered, client is within age range, HIV status is not positive and no live vaccine was administered.</dmn:text>
        </dmn:outputEntry>
        <dmn:annotationEntry>
          <dmn:text>Neonates born to women of unknown HIV status should be vaccinated as the benefits of BCG vaccination outweigh the risks. Neonates of unknown HIV status born to HIV-infected women should be vaccinated if they have no clinical evidence suggestive of HIV infection.</dmn:text>
        </dmn:annotationEntry>
        <dmn:annotationEntry>
          <dmn:text>WHO recommendations for routine immunization â€“ summary tables (March 2023) (1)</dmn:text>
        </dmn:annotationEntry>
      </dmn:rule>
      <dmn:rule id="rule.DAK.DT.IMMZ.D2.DT.BCG.rule.NoBCGprimaryseriesd7a5f0871c">
        <dmn:inputEntry>
          <dmn:description>Count of vaccines administered (where "Vaccine type" = "BCG vaccines" and "Type of dose" = "Primary series") = 0</dmn:description>
          <dmn:text>No BCG primary series dose was administered</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>Today's date âˆ’ "Date of birth" â‰¤ 28 days</dmn:description>
          <dmn:text>Clients age is less than or equal to 28 days</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"HIV status" â‰  "HIV-positive"</dmn:description>
          <dmn:text>Clients HIV status is negative or unknown</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>Today's date âˆ’ latest "Date and time of vaccination" (where "Live vaccine" = TRUE) &lt; 4 weeks</dmn:description>
          <dmn:text>Live vaccine was administered in the last four weeks</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry>
          <dmn:description>"Immunization recommendation status" = "Not due"</dmn:description>
          <dmn:text>Client is not due for BCG vaccination</dmn:text>
        </dmn:outputEntry>
        <dmn:outputEntry>
          <dmn:description>Check for any vaccines due and inform the caregiver of when to come back for the first BCG dose.</dmn:description>
          <dmn:text>Should not vaccinate client with first BCG dose as live vaccine was administered in the last 4 weeks.</dmn:text>
        </dmn:outputEntry>
      </dmn:rule>
      <dmn:rule id="rule.DAK.DT.IMMZ.D2.DT.BCG.rule.NoBCGprimaryseries217fa98180">
        <dmn:inputEntry>
          <dmn:description>Count of vaccines administered (where "Vaccine type" = "BCG vaccines" and "Type of dose" = "Primary series") = 0</dmn:description>
          <dmn:text>No BCG primary series dose was administered</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>Today's date âˆ’ "Date of birth" â‰¤ 28 days</dmn:description>
          <dmn:text>Clients age is less than or equal to 28 days</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"HIV status" = "HIV-positive"</dmn:description>
          <dmn:text>Clients HIV status is positive</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"Currently on ART" = TRUE</dmn:description>
          <dmn:text>Client is currently receiving antiretroviral therapy</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"Immunologically stable" = TRUE</dmn:description>
          <dmn:text>Client is immunologically stable</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>Today's date âˆ’ latest "Date and time of vaccination" (where "Live vaccine" = TRUE) IS NULL</dmn:description>
          <dmn:text>No live vaccine was administered</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry>
          <dmn:description>"Immunization recommendation status" = "Due"</dmn:description>
          <dmn:text>Client is due for BCG vaccination</dmn:text>
        </dmn:outputEntry>
        <dmn:outputEntry>
          <dmn:description>Check for contraindications.</dmn:description>
          <dmn:text>Should vaccinate client with first BCG dose as no BCG dose was administered, client is immunologically stable and no live vaccine was administered.</dmn:text>
        </dmn:outputEntry>
        <dmn:annotationEntry>
          <dmn:text>For neonates with HIV infection confirmed by early virological testing, BCG vaccination should be delayed until ART has been started and the infant confirmed to be immunologically stable (CD4 &gt; 25%).
Moderate-to-late preterm infants (gestational age &gt; 31 weeks) and low-birth-weight infants (&lt; 2500 g) who are healthy and clinically stable can receive BCG vaccination at birth, or at the latest, upon discharge.</dmn:text>
        </dmn:annotationEntry>
      </dmn:rule>
      <dmn:rule id="rule.DAK.DT.IMMZ.D2.DT.BCG.rule.NoBCGprimaryseriesbe5500e1fb">
        <dmn:inputEntry>
          <dmn:description>Count of vaccines administered (where "Vaccine type" = "BCG vaccines" and "Type of dose" = "Primary series") = 0</dmn:description>
          <dmn:text>No BCG primary series dose was administered</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>Today's date âˆ’ "Date of birth" â‰¤ 28 days</dmn:description>
          <dmn:text>Clients age is less than or equal to 28 days</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"HIV status" = "HIV-positive"</dmn:description>
          <dmn:text>Clients HIV status is positive</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"Currently on ART" = TRUE</dmn:description>
          <dmn:text>Client is currently receiving antiretroviral therapy</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"Immunologically stable" = TRUE</dmn:description>
          <dmn:text>Client is immunologically stable</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>Today's date âˆ’ latest "Date and time of vaccination" (where "Live vaccine" = TRUE) &lt; 4 weeks</dmn:description>
          <dmn:text>Live vaccine was administered in the last four weeks</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry>
          <dmn:description>"Immunization recommendation status" = "Not due"</dmn:description>
          <dmn:text>Client is not due for BCG vaccination</dmn:text>
        </dmn:outputEntry>
        <dmn:outputEntry>
          <dmn:description>Check for any vaccines due and inform the caregiver of when to come back for the first BCG dose.</dmn:description>
          <dmn:text>Should not vaccinate client with first BCG dose as live vaccine was administered in the last 4 weeks.</dmn:text>
        </dmn:outputEntry>
      </dmn:rule>
      <dmn:rule id="rule.DAK.DT.IMMZ.D2.DT.BCG.rule.NoBCGprimaryseriesc6687e3d34">
        <dmn:inputEntry>
          <dmn:description>Count of vaccines administered (where "Vaccine type" = "BCG vaccines" and "Type of dose" = "Primary series") = 0</dmn:description>
          <dmn:text>No BCG primary series dose was administered</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>Today's date âˆ’ "Date of birth" â‰¤ 28 days</dmn:description>
          <dmn:text>Clients age is less than or equal to 28 days</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"HIV status" = "HIV-positive"</dmn:description>
          <dmn:text>Clients HIV status is positive</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"Currently on ART" = TRUE</dmn:description>
          <dmn:text>Client is currently receiving antiretroviral therapy</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"Immunologically stable" = FALSE</dmn:description>
          <dmn:text>Client is not immunologically stable</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry>
          <dmn:description>"Immunization recommendation status" = "Not due"</dmn:description>
          <dmn:text>Client is not due for BCG vaccination</dmn:text>
        </dmn:outputEntry>
        <dmn:outputEntry>
          <dmn:description>Check for any vaccines due and inform the caregiver of when to come back for the first BCG dose.</dmn:description>
          <dmn:text>Should not vaccinate client with first BCG dose as client is not immunologically stable.</dmn:text>
        </dmn:outputEntry>
        <dmn:annotationEntry>
          <dmn:text>For neonates with HIV infection confirmed by early virological testing, BCG vaccination should be delayed until ART has been started and the infant confirmed to be immunologically stable (CD4 &gt; 25%).</dmn:text>
        </dmn:annotationEntry>
      </dmn:rule>
      <dmn:rule id="rule.DAK.DT.IMMZ.D2.DT.BCG.rule.NoBCGprimaryserieseae04a9d28">
        <dmn:inputEntry>
          <dmn:description>Count of vaccines administered (where "Vaccine type" = "BCG vaccines" and "Type of dose" = "Primary series") = 0</dmn:description>
          <dmn:text>No BCG primary series dose was administered</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>Today's date âˆ’ "Date of birth" â‰¤ 28 days</dmn:description>
          <dmn:text>Clients age is less than or equal to 28 days</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"HIV status" = "HIV-positive"</dmn:description>
          <dmn:text>Clients HIV status is positive</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"Currently on ART" = FALSE</dmn:description>
          <dmn:text>Client is currently not receiving antiretroviral therapy</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry>
          <dmn:description>"Immunization recommendation status" = "Not due"</dmn:description>
          <dmn:text>Client is not due for BCG vaccination</dmn:text>
        </dmn:outputEntry>
        <dmn:outputEntry>
          <dmn:description>Check for any vaccines due and inform the caregiver of when to come back for the first BCG dose.</dmn:description>
          <dmn:text>Should not vaccinate client with first BCG dose as ART has not been started.</dmn:text>
        </dmn:outputEntry>
      </dmn:rule>
      <dmn:rule id="rule.DAK.DT.IMMZ.D2.DT.BCG.rule.NoBCGprimaryseries5332dd9d08">
        <dmn:inputEntry>
          <dmn:description>Count of vaccines administered (where "Vaccine type" = "BCG vaccines" and "Type of dose" = "Primary series") = 0</dmn:description>
          <dmn:text>No BCG primary series dose was administered</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>28 days &lt; Today's date âˆ’ "Date of birth" &lt; 5 years</dmn:description>
          <dmn:text>Clients age is between 28 days and 5 years</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"HIV status" â‰  "HIV-positive"</dmn:description>
          <dmn:text>Clients HIV status is negative or unknown</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"TB infection test result" = "Negative"</dmn:description>
          <dmn:text>Clients TB infection test result is negative</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>Today's date âˆ’ latest "Date and time of vaccination" (where "Live vaccine" = TRUE) â‰¥ 4 weeks</dmn:description>
          <dmn:text>No live vaccine was administered in the last four weeks</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry>
          <dmn:description>"Immunization recommendation status" = "Due"</dmn:description>
          <dmn:text>Client is due for BCG vaccination</dmn:text>
        </dmn:outputEntry>
        <dmn:outputEntry>
          <dmn:description>Check for contraindications.</dmn:description>
          <dmn:text>Should vaccinate client with first BCG dose as no BCG dose was administered, clients TB test result is negative and no live vaccine was administered in the past 4 weeks.</dmn:text>
        </dmn:outputEntry>
        <dmn:annotationEntry>
          <dmn:text>BCG vaccination is also recommended for unvaccinated older children negative for tuberculin skin test (TST) or interferon-gamma release assay (IGRA) who are in settings with high incidence of TB and/or high leprosy burden or those moving from low-to-high TB incidence/leprosy burden settings.</dmn:text>
        </dmn:annotationEntry>
      </dmn:rule>
      <dmn:rule id="rule.DAK.DT.IMMZ.D2.DT.BCG.rule.NoBCGprimaryseries467027ccf2">
        <dmn:inputEntry>
          <dmn:description>Count of vaccines administered (where "Vaccine type" = "BCG vaccines" and "Type of dose" = "Primary series") = 0</dmn:description>
          <dmn:text>No BCG primary series dose was administered</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>28 days &lt; Today's date âˆ’ "Date of birth" &lt; 5 years</dmn:description>
          <dmn:text>Clients age is between 28 days and 5 years</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"HIV status" â‰  "HIV-positive"</dmn:description>
          <dmn:text>Clients HIV status is negative or unknown</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"TB infection test result" = "Negative"</dmn:description>
          <dmn:text>Clients TB infection test result is negative</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>Today's date âˆ’ latest "Date and time of vaccination" (where "Live vaccine" = TRUE) &lt; 4 weeks</dmn:description>
          <dmn:text>Live vaccine was administered in the last four weeks</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry>
          <dmn:description>"Immunization recommendation status" = "Not due"</dmn:description>
          <dmn:text>Client is not due for BCG vaccination</dmn:text>
        </dmn:outputEntry>
        <dmn:outputEntry>
          <dmn:description>Check for any vaccines due and inform the caregiver of when to come back for the first dose.</dmn:description>
          <dmn:text>Should not vaccinate client with first BCG dose as live vaccine was administered in the past 4 weeks.</dmn:text>
        </dmn:outputEntry>
      </dmn:rule>
      <dmn:rule id="rule.DAK.DT.IMMZ.D2.DT.BCG.rule.NoBCGprimaryseries8ae2e0db77">
        <dmn:inputEntry>
          <dmn:description>Count of vaccines administered (where "Vaccine type" = "BCG vaccines" and "Type of dose" = "Primary series") = 0</dmn:description>
          <dmn:text>No BCG primary series dose was administered</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>28 days &lt; Today's date âˆ’ "Date of birth" &lt; 5 years</dmn:description>
          <dmn:text>Clients age is between 28 days and 5 years</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"HIV status" â‰  "HIV-positive"</dmn:description>
          <dmn:text>Clients HIV status is negative or unknown</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"TB infection test result" IS NULL</dmn:description>
          <dmn:text>Clients TB infection test result is unknown (test not done or no result yet)</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry>
          <dmn:description>"Immunization recommendation status" = "Further evaluation needed"</dmn:description>
          <dmn:text>Clinical judgement is required. Create clinical note.</dmn:text>
        </dmn:outputEntry>
        <dmn:outputEntry>
          <dmn:description>Re-evaluate client once the test result is available.</dmn:description>
          <dmn:text>Recommend the client to perform TB infection testing.</dmn:text>
        </dmn:outputEntry>
      </dmn:rule>
      <dmn:rule id="rule.DAK.DT.IMMZ.D2.DT.BCG.rule.NoBCGprimaryseries42a7de4f7e">
        <dmn:inputEntry>
          <dmn:description>Count of vaccines administered (where "Vaccine type" = "BCG vaccines" and "Type of dose" = "Primary series") = 0</dmn:description>
          <dmn:text>No BCG primary series dose was administered</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>28 days &lt; Today's date âˆ’ "Date of birth" &lt; 5 years</dmn:description>
          <dmn:text>Clients age is between 28 days and 5 years</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"HIV status" â‰  "HIV-positive"</dmn:description>
          <dmn:text>Clients HIV status is negative or unknown</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"TB infection test result" = "Positive"</dmn:description>
          <dmn:text>Clients TB infection test result is positive</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry>
          <dmn:description>"Immunization recommendation status" = "Not due"</dmn:description>
          <dmn:text>Client is not due for BCG vaccination</dmn:text>
        </dmn:outputEntry>
        <dmn:outputEntry>
          <dmn:description>Should not vaccinate client with first BCG dose as client's TB infection test result is positive. Consider evaluating for TB disease or for TB preventive treatment (TPT) eligibility (once TB disease is ruled out).</dmn:description>
          <dmn:text>Should not vaccinate client with first BCG dose as clients TB infection test result is positive. Consider evaluating for TB disease or for TB preventive treatment (TPT) eligibility (once TB disease is ruled out).</dmn:text>
        </dmn:outputEntry>
      </dmn:rule>
      <dmn:rule id="rule.DAK.DT.IMMZ.D2.DT.BCG.rule.NoBCGprimaryseriescf4b72f498">
        <dmn:inputEntry>
          <dmn:description>Count of vaccines administered (where "Vaccine type" = "BCG vaccines" and "Type of dose" = "Primary series") = 0</dmn:description>
          <dmn:text>No BCG primary series dose was administered</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>28 days &lt; Today's date âˆ’ "Date of birth" &lt; 5 years</dmn:description>
          <dmn:text>Clients age is between 28 days and 5 years</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"HIV status" = "HIV-positive"</dmn:description>
          <dmn:text>Clients HIV status is positive</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"Currently on ART" = TRUE</dmn:description>
          <dmn:text>Client is currently receiving antiretroviral therapy</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"Immunologically stable" = FALSE</dmn:description>
          <dmn:text>Client is not immunologically stable</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry>
          <dmn:description>"Immunization recommendation status" = "Not due"</dmn:description>
          <dmn:text>Client is not due for BCG vaccination</dmn:text>
        </dmn:outputEntry>
        <dmn:outputEntry>
          <dmn:description>Check for any vaccines due, and inform the caregiver of when to come back for the first BCG dose.</dmn:description>
          <dmn:text>Should not vaccinate client with first BCG dose as client is not immunologically stable.</dmn:text>
        </dmn:outputEntry>
        <dmn:annotationEntry>
          <dmn:text>If children infected with HIV are receiving ART and are clinically well and immunologically stable (CD4% &gt; 25% for children aged under 5 years), they should be vaccinated with BCG.</dmn:text>
        </dmn:annotationEntry>
      </dmn:rule>
      <dmn:rule id="rule.DAK.DT.IMMZ.D2.DT.BCG.rule.NoBCGprimaryseries79e6f40292">
        <dmn:inputEntry>
          <dmn:description>Count of vaccines administered (where "Vaccine type" = "BCG vaccines" and "Type of dose" = "Primary series") = 0</dmn:description>
          <dmn:text>No BCG primary series dose was administered</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>28 days &lt; Today's date âˆ’ "Date of birth" &lt; 5 years</dmn:description>
          <dmn:text>Clients age is between 28 days and 5 years</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"HIV status" = "HIV-positive"</dmn:description>
          <dmn:text>Clients HIV status is positive</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"Currently on ART" = TRUE</dmn:description>
          <dmn:text>Client is currently receiving antiretroviral therapy</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"Clinically well" = FALSE</dmn:description>
          <dmn:text>Client is not clinically well</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry>
          <dmn:description>"Immunization recommendation status" = "Not due"</dmn:description>
          <dmn:text>Client is not due for BCG vaccination</dmn:text>
        </dmn:outputEntry>
        <dmn:outputEntry>
          <dmn:description>Check for any vaccines due, and inform the caregiver of when to come back for the first BCG dose.</dmn:description>
          <dmn:text>Should not vaccinate client with first BCG dose as client is not clinically well.</dmn:text>
        </dmn:outputEntry>
      </dmn:rule>
      <dmn:rule id="rule.DAK.DT.IMMZ.D2.DT.BCG.rule.NoBCGprimaryseriesd8c636521b">
        <dmn:inputEntry>
          <dmn:description>Count of vaccines administered (where "Vaccine type" = "BCG vaccines" and "Type of dose" = "Primary series") = 0</dmn:description>
          <dmn:text>No BCG primary series dose was administered</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>28 days &lt; Today's date âˆ’ "Date of birth" &lt; 5 years</dmn:description>
          <dmn:text>Clients age is between 28 days and 5 years</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"HIV status" = "HIV-positive"</dmn:description>
          <dmn:text>Clients HIV status is positive</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"Currently on ART" = TRUE</dmn:description>
          <dmn:text>Client is currently receiving antiretroviral therapy</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"Immunologically stable" = TRUE</dmn:description>
          <dmn:text>Client is immunologically stable</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>Today's date âˆ’ latest "Date and time of vaccination" (where "Live vaccine" = TRUE) â‰¥ 4 weeks</dmn:description>
          <dmn:text>No live vaccine was administered in the last four weeks</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"Clinically well" = TRUE</dmn:description>
          <dmn:text>Client is clinically well</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry>
          <dmn:description>"Immunization recommendation status" = "Due"</dmn:description>
          <dmn:text>Client is due for BCG vaccination</dmn:text>
        </dmn:outputEntry>
        <dmn:outputEntry>
          <dmn:description>Check for contraindications.</dmn:description>
          <dmn:text>Should vaccinate client with first BCG dose as no BCG dose was administered, client is receiving ART, clinically well and immunologically stable. No live vaccine was administered in the last 4 weeks.</dmn:text>
        </dmn:outputEntry>
      </dmn:rule>
      <dmn:rule id="rule.DAK.DT.IMMZ.D2.DT.BCG.rule.NoBCGprimaryseriesc4486be145">
        <dmn:inputEntry>
          <dmn:description>Count of vaccines administered (where "Vaccine type" = "BCG vaccines" and "Type of dose" = "Primary series") = 0</dmn:description>
          <dmn:text>No BCG primary series dose was administered</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>28 days &lt; Today's date âˆ’ "Date of birth" &lt; 5 years</dmn:description>
          <dmn:text>Clients age is between 28 days and 5 years</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"HIV status" = "HIV-positive"</dmn:description>
          <dmn:text>Clients HIV status is positive</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"Currently on ART" = TRUE</dmn:description>
          <dmn:text>Client is currently receiving antiretroviral therapy</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"Immunologically stable" = TRUE</dmn:description>
          <dmn:text>Client is immunologically stable</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>Today's date âˆ’ latest "Date and time of vaccination" (where "Live vaccine" = TRUE) &lt; 4 weeks</dmn:description>
          <dmn:text>Live vaccine was administered in the last four weeks</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"Clinically well" = TRUE</dmn:description>
          <dmn:text>Client is clinically well</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry>
          <dmn:description>"Immunization recommendation status" = "Not due"</dmn:description>
          <dmn:text>Client is not due for BCG vaccination</dmn:text>
        </dmn:outputEntry>
        <dmn:outputEntry>
          <dmn:description>Check for any vaccines due and inform the caregiver of when to come back for the first BCG dose.</dmn:description>
          <dmn:text>Should not vaccinate client with first BCG dose as live vaccine was administered in the past 4 weeks.</dmn:text>
        </dmn:outputEntry>
      </dmn:rule>
      <dmn:rule id="rule.DAK.DT.IMMZ.D2.DT.BCG.rule.NoBCGprimaryseries917e22c878">
        <dmn:inputEntry>
          <dmn:description>Count of vaccines administered (where "Vaccine type" = "BCG vaccines" and "Type of dose" = "Primary series") = 0</dmn:description>
          <dmn:text>No BCG primary series dose was administered</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>28 days &lt; Today's date âˆ’ "Date of birth" &lt; 5 years</dmn:description>
          <dmn:text>Clients age is between 28 days and 5 years</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"HIV status" = "HIV-positive"</dmn:description>
          <dmn:text>Clients HIV status is positive</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"Currently on ART" = FALSE</dmn:description>
          <dmn:text>Client is currently not receiving antiretroviral therapy</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry>
          <dmn:description>"Immunization recommendation status" = "Not due"</dmn:description>
          <dmn:text>Client is not due for BCG vaccination</dmn:text>
        </dmn:outputEntry>
        <dmn:outputEntry>
          <dmn:description>Check for any vaccines due and inform the caregiver of when to come back for the first BCG dose.</dmn:description>
          <dmn:text>Should not vaccinate client with first BCG dose as client is not currently receiving ART.</dmn:text>
        </dmn:outputEntry>
      </dmn:rule>
      <dmn:rule id="rule.DAK.DT.IMMZ.D2.DT.BCG.rule.NoBCGprimaryseriesf819383eed">
        <dmn:inputEntry>
          <dmn:description>Count of vaccines administered (where "Vaccine type" = "BCG vaccines" and "Type of dose" = "Primary series") = 0</dmn:description>
          <dmn:text>No BCG primary series dose was administered</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>Today's date âˆ’ "Date of birth" â‰¥ 5 years</dmn:description>
          <dmn:text>Clients age is more than 5 years</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"HIV status" â‰  "HIV-positive"</dmn:description>
          <dmn:text>Clients HIV status is negative or unknown</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"TB infection test result" = "Negative"</dmn:description>
          <dmn:text>Clients TB infection test result is negative</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>Today's date âˆ’ latest "Date and time of vaccination" (where "Live vaccine" = TRUE) â‰¥ 4 weeks</dmn:description>
          <dmn:text>No live vaccine was administered in the last four weeks</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry>
          <dmn:description>"Immunization recommendation status" = "Due"</dmn:description>
          <dmn:text>Client is due for BCG vaccination</dmn:text>
        </dmn:outputEntry>
        <dmn:outputEntry>
          <dmn:description>Check for contraindications.</dmn:description>
          <dmn:text>Should vaccinate client with first BCG dose as no BCG dose was administered, clients TB test result is negative and no live vaccine was administered in the past 4 weeks.</dmn:text>
        </dmn:outputEntry>
        <dmn:annotationEntry>
          <dmn:text>BCG vaccination is also recommended for unvaccinated older children, adolescents and adults negative for TST or IGRA who are in settings with high incidence of TB and/or high leprosy burden, those moving from low-to-high TB incidence/leprosy burden settings and persons at risk of occupational exposure in low and high TB incidence areas (e.g. health workers, laboratory workers, medical students, prison workers, other individuals with occupational exposure)</dmn:text>
        </dmn:annotationEntry>
      </dmn:rule>
      <dmn:rule id="rule.DAK.DT.IMMZ.D2.DT.BCG.rule.NoBCGprimaryseriescc89cec30a">
        <dmn:inputEntry>
          <dmn:description>Count of vaccines administered (where "Vaccine type" = "BCG vaccines" and "Type of dose" = "Primary series") = 0</dmn:description>
          <dmn:text>No BCG primary series dose was administered</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>Today's date âˆ’ "Date of birth" â‰¥ 5 years</dmn:description>
          <dmn:text>Clients age is more than 5 years</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"HIV status" â‰  "HIV-positive"</dmn:description>
          <dmn:text>Clients HIV status is negative or unknown</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"TB infection test result" = "Negative"</dmn:description>
          <dmn:text>Clients TB infection test result is negative</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>Today's date âˆ’ latest "Date and time of vaccination" (where "Live vaccine" = TRUE) &lt; 4 weeks</dmn:description>
          <dmn:text>Live vaccine was administered in the last four weeks</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry>
          <dmn:description>"Immunization recommendation status" = "Not due"</dmn:description>
          <dmn:text>Client is not due for BCG vaccination</dmn:text>
        </dmn:outputEntry>
        <dmn:outputEntry>
          <dmn:description>Check for any vaccines due, and inform the caregiver of when to come back for the first BCG dose.</dmn:description>
          <dmn:text>Should not vaccinate client with first BCG dose as live vaccine was administered in the last 4 weeks.</dmn:text>
        </dmn:outputEntry>
      </dmn:rule>
      <dmn:rule id="rule.DAK.DT.IMMZ.D2.DT.BCG.rule.NoBCGprimaryseries88540549a1">
        <dmn:inputEntry>
          <dmn:description>Count of vaccines administered (where "Vaccine type" = "BCG vaccines" and "Type of dose" = "Primary series") = 0</dmn:description>
          <dmn:text>No BCG primary series dose was administered</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>Today's date âˆ’ "Date of birth" â‰¥ 5 years</dmn:description>
          <dmn:text>Clients age is more than 5 years</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"HIV status" â‰  "HIV-positive"</dmn:description>
          <dmn:text>Clients HIV status is negative or unknown</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"TB infection test result" IS NULL</dmn:description>
          <dmn:text>Clients TB infection test result is unknown (test not done or no result yet)</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry>
          <dmn:description>'"Immunization recommendation status" = "Further evaluation needed"</dmn:description>
          <dmn:text>Clinical judgement is required. Create clinical note.</dmn:text>
        </dmn:outputEntry>
        <dmn:outputEntry>
          <dmn:description>Re-evaluate client once the test result is available.</dmn:description>
          <dmn:text>Recommend the client to perform TB infection testing.</dmn:text>
        </dmn:outputEntry>
      </dmn:rule>
      <dmn:rule id="rule.DAK.DT.IMMZ.D2.DT.BCG.rule.NoBCGprimaryseries869a3231aa">
        <dmn:inputEntry>
          <dmn:description>Count of vaccines administered (where "Vaccine type" = "BCG vaccines" and "Type of dose" = "Primary series") = 0</dmn:description>
          <dmn:text>No BCG primary series dose was administered</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>Today's date âˆ’ "Date of birth" â‰¥ 5 years</dmn:description>
          <dmn:text>Clients age is more than 5 years</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"HIV status" â‰  "HIV-positive"</dmn:description>
          <dmn:text>Clients HIV status is negative or unknown</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"TB infection test result" = "Positive"</dmn:description>
          <dmn:text>Clients TB infection test result is positive</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry>
          <dmn:description>"Immunization recommendation status" = "Not due"</dmn:description>
          <dmn:text>Client is not due for BCG vaccination</dmn:text>
        </dmn:outputEntry>
        <dmn:outputEntry>
          <dmn:description>Should not vaccinate client with first BCG dose as client's TB infection test result is positive. Consider evaluating for TB disease or for TB preventive treatment (TPT) eligibility (once TB disease is ruled out).</dmn:description>
          <dmn:text>Should not vaccinate client with first BCG dose as clients TB infection test result is positive. Consider evaluating for TB disease or for TB preventive treatment (TPT) eligibility (once TB disease is ruled out).</dmn:text>
        </dmn:outputEntry>
      </dmn:rule>
      <dmn:rule id="rule.DAK.DT.IMMZ.D2.DT.BCG.rule.NoBCGprimaryseries0acf940402">
        <dmn:inputEntry>
          <dmn:description>Count of vaccines administered (where "Vaccine type" = "BCG vaccines" and "Type of dose" = "Primary series") = 0</dmn:description>
          <dmn:text>No BCG primary series dose was administered</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>Today's date âˆ’ "Date of birth" â‰¥ 5 years</dmn:description>
          <dmn:text>Clients age is more than 5 years</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"HIV status" = "HIV-positive"</dmn:description>
          <dmn:text>Clients HIV status is positive</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"Currently on ART" = TRUE</dmn:description>
          <dmn:text>Client is currently receiving antiretroviral therapy</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"Immunologically stable" = FALSE</dmn:description>
          <dmn:text>Client is not immunologically stable</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry>
          <dmn:description>"Immunization recommendation status" = "Not due"</dmn:description>
          <dmn:text>Client is not due for BCG vaccination</dmn:text>
        </dmn:outputEntry>
        <dmn:outputEntry>
          <dmn:description>Check for any vaccines due, and inform the caregiver of when to come back for the first BCG dose.</dmn:description>
          <dmn:text>Should not vaccinate client with first BCG dose as client is not immnologically stable.</dmn:text>
        </dmn:outputEntry>
        <dmn:annotationEntry>
          <dmn:text>If individuals infected with HIV are receiving ART, are clinically well and immunologically stable (CD4 count â‰¥ 200), they should be vaccinated with BCG.</dmn:text>
        </dmn:annotationEntry>
      </dmn:rule>
      <dmn:rule id="rule.DAK.DT.IMMZ.D2.DT.BCG.rule.NoBCGprimaryseriese23aea9649">
        <dmn:inputEntry>
          <dmn:description>Count of vaccines administered (where "Vaccine type" = "BCG vaccines" and "Type of dose" = "Primary series") = 0</dmn:description>
          <dmn:text>No BCG primary series dose was administered</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>Today's date âˆ’ "Date of birth" â‰¥ 5 years</dmn:description>
          <dmn:text>Clients age is more than 5 years</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"HIV status" = "HIV-positive"</dmn:description>
          <dmn:text>Clients HIV status is positive</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"Currently on ART" = TRUE</dmn:description>
          <dmn:text>Client is currently receiving antiretroviral therapy</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"Clinically well" = FALSE</dmn:description>
          <dmn:text>Client is not clinically well</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry>
          <dmn:description>"Immunization recommendation status" = "Not due"</dmn:description>
          <dmn:text>Client is not due for BCG vaccination</dmn:text>
        </dmn:outputEntry>
        <dmn:outputEntry>
          <dmn:description>Check for any vaccines due and inform the caregiver of when to come back for the first BCG dose.</dmn:description>
          <dmn:text>Should not vaccinate client with first BCG dose as client is not clinically well.</dmn:text>
        </dmn:outputEntry>
      </dmn:rule>
      <dmn:rule id="rule.DAK.DT.IMMZ.D2.DT.BCG.rule.NoBCGprimaryseriesd0699f5a80">
        <dmn:inputEntry>
          <dmn:description>Count of vaccines administered (where "Vaccine type" = "BCG vaccines" and "Type of dose" = "Primary series") = 0</dmn:description>
          <dmn:text>No BCG primary series dose was administered</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>Today's date âˆ’ "Date of birth" â‰¥ 5 years</dmn:description>
          <dmn:text>Clients age is more than 5 years</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"HIV status" = "HIV-positive"</dmn:description>
          <dmn:text>Clients HIV status is positive</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"Currently on ART" = TRUE</dmn:description>
          <dmn:text>Client is currently receiving antiretroviral therapy</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"Immunologically stable" = TRUE</dmn:description>
          <dmn:text>Client is immunologically stable</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>Today's date âˆ’ latest "Date and time of vaccination" (where "Live vaccine" = TRUE) â‰¥ 4 weeks</dmn:description>
          <dmn:text>No live vaccine was administered in the last four weeks</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"Clinically well" = TRUE</dmn:description>
          <dmn:text>Client is clinically well</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry>
          <dmn:description>"Immunization recommendation status" = "Due"</dmn:description>
          <dmn:text>Client is due for BCG vaccination</dmn:text>
        </dmn:outputEntry>
        <dmn:outputEntry>
          <dmn:description>Check for contraindications</dmn:description>
          <dmn:text>Should vaccinate client with first BCG dose as no BCG dose was administered, client is receiving ART, clinically well and immunologically stable. No live vaccine was administered in the past 4 weeks.</dmn:text>
        </dmn:outputEntry>
      </dmn:rule>
      <dmn:rule id="rule.DAK.DT.IMMZ.D2.DT.BCG.rule.NoBCGprimaryseries5f01c5d112">
        <dmn:inputEntry>
          <dmn:description>Count of vaccines administered (where "Vaccine type" = "BCG vaccines" and "Type of dose" = "Primary series") = 0</dmn:description>
          <dmn:text>No BCG primary series dose was administered</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>Today's date âˆ’ "Date of birth" â‰¥ 5 years</dmn:description>
          <dmn:text>Clients age is more than 5 years</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"HIV status" = "HIV-positive"</dmn:description>
          <dmn:text>Clients HIV status is positive</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"Currently on ART" = TRUE</dmn:description>
          <dmn:text>Client is currently receiving antiretroviral therapy</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"Immunologically stable" = TRUE</dmn:description>
          <dmn:text>Client is immunologically stable</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>Today's date âˆ’ latest "Date and time of vaccination" (where "Live vaccine" = TRUE) &lt; 4 weeks</dmn:description>
          <dmn:text>Live vaccine was administered in the last four weeks</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"Clinically well" = TRUE</dmn:description>
          <dmn:text>Client is clinically well</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry>
          <dmn:description>"Immunization recommendation status" = "Not due"</dmn:description>
          <dmn:text>Client is not due for BCG vaccination</dmn:text>
        </dmn:outputEntry>
        <dmn:outputEntry>
          <dmn:description>Check for any vaccines due, and inform the caregiver of when to come back for the first BCG dose.</dmn:description>
          <dmn:text>Should not vaccinate client with first BCG dose as live vaccine was administered in the past 4 weeks.</dmn:text>
        </dmn:outputEntry>
      </dmn:rule>
      <dmn:rule id="rule.DAK.DT.IMMZ.D2.DT.BCG.rule.NoBCGprimaryseriesff7a992896">
        <dmn:inputEntry>
          <dmn:description>Count of vaccines administered (where "Vaccine type" = "BCG vaccines" and "Type of dose" = "Primary series") = 0</dmn:description>
          <dmn:text>No BCG primary series dose was administered</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>Today's date âˆ’ "Date of birth" â‰¥ 5 years</dmn:description>
          <dmn:text>Clients age is more than 5 years</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"HIV status" = "HIV-positive"</dmn:description>
          <dmn:text>Clients HIV status is positive</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>"Currently on ART" = FALSE</dmn:description>
          <dmn:text>Client is currently not receiving antiretroviral therapy</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry>
          <dmn:description>"Immunization recommendation status" = "Not due"</dmn:description>
          <dmn:text>Client is not due for BCG vaccination</dmn:text>
        </dmn:outputEntry>
        <dmn:outputEntry>
          <dmn:description>Check for any vaccines due and inform the caregiver of when to come back for the first BCG dose.</dmn:description>
          <dmn:text>Should not vaccinate client with first BCG dose as client is not currently receiving ART.</dmn:text>
        </dmn:outputEntry>
        <dmn:annotationEntry>
          <dmn:text>â€“</dmn:text>
        </dmn:annotationEntry>
      </dmn:rule>
      <dmn:rule id="rule.DAK.DT.IMMZ.D2.DT.BCG.rule.OneBCGprimaryseriee6855eedca">
        <dmn:inputEntry>
          <dmn:description>Count of vaccines administered (where "Vaccine type" = "BCG vaccines" and "Type of dose" = "Primary series") = 1</dmn:description>
          <dmn:text>One BCG primary series dose was administered</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry>
          <dmn:description>â€“</dmn:description>
          <dmn:text>â€“</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry>
          <dmn:description>'"Immunization recommendation status" = "Complete"
"Completed the primary vaccination series" = TRUE (where "Vaccine type" = "BCG vaccines")</dmn:description>
          <dmn:text>BCG immunization schedule is complete</dmn:text>
        </dmn:outputEntry>
        <dmn:outputEntry>
          <dmn:description>Check for any vaccines due.</dmn:description>
          <dmn:text>BCG immunization schedule is complete. One BCG primary series dose was administered.</dmn:text>
        </dmn:outputEntry>
        <dmn:annotationEntry>
          <dmn:text>â€“</dmn:text>
        </dmn:annotationEntry>
      </dmn:rule>
    </dmn:decisionTable>
  </dmn:decision>
</dmn:definitions>
</code></pre>
