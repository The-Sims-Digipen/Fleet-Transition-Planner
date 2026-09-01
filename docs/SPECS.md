# Fleet Transition Planner

## Product purpose

The Fleet Transition Planner helps a fleet manager decide which diesel vehicles to replace with electric vehicles, when to replace them, what the transition will cost, how quickly it will pay back, and how it will affect emissions and depot power demand.

The application should turn a complicated planning exercise into something that can be understood at a glance. The user should always be able to connect a number or recommendation to the vehicles, chargers, years, and physical depot conditions that produced it.

## Experience principles

- The depot is the centre of the experience, not decoration around a spreadsheet.
- Every change should feel immediate. Editing a plan, changing an assumption, or moving through time should update the visible outcome without an extra confirmation step.
- Important conclusions should be explained in plain language.
- Financial, emissions, and power results should remain visible together so that the user can understand their trade-offs.
- Warnings should describe what is wrong, why it happened, and what could resolve it.
- The application should remain easy to navigate with a fleet of approximately one hundred vehicles.

## Overall workspace

The application opens into a planning workspace with the following areas:

- A header showing the application name, the active plan name, and access to plan comparison.
- A fleet area for finding vehicles, selecting them, and assigning transition years.
- An assumptions area for testing different cost, energy, and capacity conditions.
- A prominent depot view showing the physical state of the fleet and charging infrastructure.
- A timeline for moving through the transition years.
- Summary results and charts for cost, payback, emissions, fleet composition, chargers, and power demand.

On a wide screen, controls and the main visual workspace should be visible together. On a narrow screen, the same areas should stack in a clear reading order without horizontal scrolling or clipped controls. The depot view should remain large enough to inspect and control.

## Visual character

The application should feel like a calm, professional operations dashboard rather than a game or promotional website.

- Use a dark, low-glare workspace with clearly separated panels.
- Use amber for diesel vehicles, green for electric vehicles, blue for chargers, and red for exceeded constraints.
- Use restrained animation to make changes understandable without slowing the user down.
- Keep labels, units, legends, and selected states readable at a glance.
- Never rely on colour alone to communicate fleet type, selection, warnings, or capacity status.

## Starting and managing plans

A user should be able to create, name, duplicate, save, reopen, and remove transition plans. A newly created plan should make it clear what information is still needed before useful results can be shown.

A clearly labelled example plan may be offered to a first-time user so that the complete experience can be explored immediately. Example information must never be mistaken for the user's real fleet.

Duplicating a plan should create an independent alternative that starts with the same fleet, assumptions, and transition schedule. This should make it easy to create Plan B from Plan A and change only the decisions being compared.

## Fleet experience

The fleet area should show every vehicle with:

- Registration or fleet identifier.
- Vehicle category.
- Annual distance travelled.
- Current age.
- Current transition decision and transition year.
- A concise recommendation or status where one is available.

The user should be able to search and filter the fleet, including by category, transition status, transition year, and recommendation. Large fleets should remain easy to scan through grouping, useful summaries, and clear selected states.

The user should be able to:

- Assign a transition year to one vehicle.
- Select several vehicles and assign the same transition year to all of them.
- Select an entire vehicle category and assign a transition year to it.
- Return selected vehicles to diesel when reconsidering a plan.
- See how many vehicles will be affected before applying a bulk change.

Selecting a vehicle in the fleet area should highlight the same vehicle in the depot. Selecting a vehicle in the depot should reveal and highlight its fleet entry.

## Recommendations and explanations

The application should help answer which vehicles should transition first instead of requiring the user to discover the answer entirely by trial and error.

Each recommendation should explain the factors that support it, such as annual distance, expected operating savings, purchase cost, estimated payback, emissions reduction, vehicle age, and depot capacity consequences.

The user should be able to accept, adjust, or ignore a recommendation. Recommendations must be presented as inspectable guidance, never as an unexplained score or instruction.

When no recommendation can be made, the application should state what information is missing or which assumptions prevent a useful conclusion.

## Assumptions experience

The user should be able to test different futures by editing clearly labelled assumptions with visible units. The primary assumptions are:

- Diesel price per litre.
- Electricity price per kilowatt-hour.
- Electric vehicle purchase cost.
- Charger purchase and installation cost.
- Charger power.
- Depot power capacity.

Fuel use, electric energy use, and emissions factors should also be available without overwhelming the primary controls.

Changing an assumption should immediately update all affected recommendations, costs, payback information, emissions results, power results, charts, and comparisons.

Invalid or incomplete values should receive a nearby, plain-language explanation. The application should not display misleading results while required values are invalid.

## Depot experience

The depot view should visibly represent:

- The depot ground and parking layout.
- Individual parking bays.
- The fleet in its assigned positions.
- Installed or planned chargers and their positions.
- The selected vehicle and any selected group of vehicles.
- The depot's current power status.

The user should be able to rotate, pan, and zoom the view comfortably. Labels and a legend should make vehicle and charger states understandable without requiring prior training.

As the selected year changes:

- Diesel vehicles scheduled for replacement should visibly become electric.
- Chargers required by the plan should appear in their planned positions.
- The visible fleet totals and power status should change with the depot.
- Short, restrained transitions should make changes noticeable without obscuring the final state.

The depot should make physical problems visible. Missing charger access, unavailable parking space, and other layout conflicts should be associated with the affected bay or vehicle and explained outside the scene as well.

When power demand approaches the depot limit, the depot should show an amber caution state. When the limit is exceeded, the depot should clearly enter a red warning state. The warning should state the expected demand, the available capacity, the amount exceeded, and which planned vehicles or chargers contribute to the issue.

## Timeline experience

The timeline should cover the full planning period and always show the currently selected year prominently.

The user should be able to scrub smoothly through individual years. The depot, fleet statuses, chargers, results, warnings, and charts should stay synchronized with the selected year.

Years containing vehicle transitions should be visibly marked. The user should be able to move between years using both the timeline control and simple previous-year and next-year actions.

The timeline should make it easy to understand what changed from one year to the next, including vehicles transitioned, chargers added, new costs, emissions reductions, and changes in power demand.

## Results and charts

The selected year should show at least:

- Annual total cost.
- Annual operating cost.
- Annual vehicle and charger investment.
- Cumulative plan cost.
- Annual and cumulative emissions.
- Electric and diesel vehicle counts.
- Charger count.
- Expected peak power and depot capacity.
- Payback status.

Costs should use a clearly identified currency. Emissions should use understandable units, and power should consistently show kilowatts.

Charts should show how cost and emissions change over the planning period and should include the continued-diesel baseline. Hovering or focusing on a year should reveal exact values rather than requiring the user to estimate them from the chart.

Payback should mean the first year in which the additional transition investment has been recovered relative to the stated baseline. If no investment has occurred, payback should be shown as not applicable. If payback is outside the planning period, the application should say that it is not reached within the plan rather than presenting an incorrect year.

## Plan comparison

The user should be able to compare two named plans directly, including choices such as replacing a vehicle now versus replacing it next year.

On a wide screen, the plans should appear side by side. Both sides should use the same selected year and the same viewing context so that differences are easy to attribute to planning decisions. On a narrow screen, the user may switch between the two plan views while a persistent comparison summary keeps their differences visible.

The comparison should show:

- Which vehicles have different transition years.
- Differences in assumptions.
- Annual and cumulative cost differences.
- Payback differences.
- Annual and cumulative emissions differences.
- Differences in electric fleet size and charger count.
- Power demand, remaining capacity, and overload differences.
- The depot state for each plan at the selected year.

Differences should be expressed with clear values and plain-language conclusions. The application should make it obvious which plan is cheaper, which reduces emissions sooner, and which creates greater depot constraints, without pretending that one plan is always best on every measure.

## Feedback and exceptional states

- An empty fleet should show a clear invitation to add fleet information, not an empty dashboard full of zeroes.
- A plan with no electric transitions should show an all-diesel depot and describe payback as not applicable.
- A plan that does not reach payback should say so clearly.
- Capacity warnings should remain visible until the relevant plan or assumption changes.
- Unsaved changes should be apparent before the user leaves or switches plans.
- If a saved plan cannot be opened, the application should explain the problem without discarding the user's current work.
- Potentially destructive actions, such as removing a plan or replacing many transition decisions, should clearly identify what will be affected before they are applied.

## Accessibility and control

All essential planning actions should be usable without relying on precise pointer control. Controls should have visible labels and focus states, and the timeline should support year-by-year keyboard adjustment.

Every important fact shown in the depot should also be available as text outside the scene. Warnings must include an icon or label in addition to colour. Text, controls, charts, and selected states should maintain clear contrast throughout the application.

## Required user-visible outcomes

The experience is complete when a fleet manager can:

1. Understand the current fleet and depot at a glance.
2. Assign transition years to individual vehicles, selected groups, or whole categories.
3. Receive and inspect recommendations about which vehicles to transition and when.
4. Change assumptions and immediately understand their financial, emissions, and power consequences.
5. Move through the planning years and watch the fleet, chargers, depot, and results change together.
6. Recognize a depot layout or power-capacity problem without interpreting a spreadsheet.
7. Compare two transition plans and understand the important differences between them.
8. Explain the chosen plan to a non-technical decision-maker using the application's visible evidence.
