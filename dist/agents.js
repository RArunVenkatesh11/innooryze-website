export function initAgents(){
if(!document.querySelector('.agent-console'))return;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let motionPaused=document.documentElement.classList.contains('motion-paused');let agentIndex=0,demoTimers=[],demoStarted=false;
  const scenarios = [
    { name: 'Customer engagement', request: '“Can I move my delivery to Friday?”', intro: 'Let’s turn a question into a resolution.', steps: [['Understand the request', 'Identify the customer and what they need.'], ['Connect the context', 'Check order details and delivery availability.'], ['Prepare the action', 'Propose Friday and prepare the update.']], result: 'Delivery update prepared. Ready for approval.' },
    { name: 'Marketing', request: '“Build a follow-up for our recent event attendees.”', intro: 'From audience signals to a relevant next step.', steps: [['Find the right audience', 'Match attendees to consented CRM profiles.'], ['Bring context together', 'Group by interests and existing relationships.'], ['Prepare the follow-up', 'Draft relevant messages for campaign review.']], result: 'Audience and message drafts ready for review.' },
    { name: 'Operations', request: '“Check this invoice against the purchase order.”', intro: 'Less manual checking. More time to resolve.', steps: [['Read the documents', 'Extract invoice and purchase-order details.'], ['Compare the records', 'Check line items, amounts and supplier data.'], ['Flag what matters', 'Prepare an exception report for your team.']], result: 'Comparison complete. Exceptions ready to review.' },
    { name: 'Business workflows', request: '“Get our new partner ready for onboarding.”', intro: 'Keep the handoffs moving, with people in control.', steps: [['Gather the requirements', 'Identify the partner and required documents.'], ['Coordinate the handoffs', 'Prepare tasks for legal, finance and operations.'], ['Prepare the next step', 'Draft a welcome pack and approval checklist.']], result: 'Onboarding plan prepared. Ready for approval.' }
    ,{name:'Lead engagement',request:'“Can you help me find the right solution?”',intro:'Bring product knowledge into a useful buyer conversation.',steps:[['Answer in context','Use approved company and product knowledge.'],['Qualify the opportunity','Ask about requirements, timing and the right contact.'],['Prepare the handoff','Capture the lead, CRM context and meeting preferences.']],result:'Qualified enquiry prepared for your sales team.'},
    {name:'Company knowledge',request:'“Compare the approaches in our delivery guides.”',intro:'Make business knowledge easier to put to work.',steps:[['Find the relevant knowledge','Search permitted documents and internal sources.'],['Compare with context','Identify the relevant guidance and differences.'],['Prepare an evidence-led answer','Summarize the comparison with source references.']],result:'Comparison prepared. Ready for your team to review.'},
    {name:'Reporting',request:'“What needs our attention in this week’s performance?”',intro:'Connect performance signals with a useful next decision.',steps:[['Gather the signals','Read authorized campaign and business reporting.'],['Identify exceptions','Highlight changes, missing data and possible issues.'],['Prepare the next steps','Draft a summary and recommendations for review.']],result:'Performance summary ready. Your team decides what happens next.'}
  ];
  function stopDemoTimers() { demoTimers.forEach(clearTimeout); demoTimers = []; }
  function finishDemo() {
    $$('.workflow-steps li').forEach(li => {
      li.classList.remove('running'); li.classList.add('done');
      $('.step-check', li).textContent = '✓'; $('.step-status', li).textContent = 'Complete';
    });
    $('.workflow-result').classList.add('complete');
    $('.workflow-result p').textContent = scenarios[agentIndex].result;
    $('.replay-demo').innerHTML = 'Replay preview <span>↻</span>';
  }
  function runDemo() {
    stopDemoTimers();
    demoStarted = true;
    if (motionPaused || reduced.matches) { finishDemo(); return; }
    const steps = $$('.workflow-steps li');
    steps.forEach((li, i) => {
      li.classList.remove('running', 'done'); $('.step-check', li).textContent = String(i + 1); $('.step-status', li).textContent = 'Queued';
    });
    $('.workflow-result').classList.remove('complete');
    $('.workflow-result p').textContent = 'Following the workflow…';
    $('.replay-demo').innerHTML = 'Restart preview <span>↻</span>';
    steps.forEach((li, i) => {
      demoTimers.push(setTimeout(() => { li.classList.add('running'); $('.step-status', li).textContent = 'Working'; }, i * 1150));
      demoTimers.push(setTimeout(() => { li.classList.remove('running'); li.classList.add('done'); $('.step-check', li).textContent = '✓'; $('.step-status', li).textContent = 'Complete'; }, (i + 1) * 1150 - 150));
    });
    demoTimers.push(setTimeout(finishDemo, 3500));
  }
  function chooseAgent(index, focus = false) {
    agentIndex = index;
    const scenario = scenarios[index];
    const tabs = $$('[data-agent]');
    tabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; });
    if (focus) tabs[index].focus();
    $('#agent-console').setAttribute('aria-labelledby', `agent-tab-${index}`);
    $('.agent-name').textContent = `${scenario.name} agent`;
    $('#agent-request').textContent = scenario.request;
    $('#agent-intro').textContent = scenario.intro;
    $$('.workflow-steps li').forEach((li, i) => { $('strong', li).textContent = scenario.steps[i][0]; $('p', li).textContent = scenario.steps[i][1]; });
    runDemo();
  }
  $$('[data-agent]').forEach(button => {
    button.addEventListener('click', () => chooseAgent(Number(button.dataset.agent)));
    button.addEventListener('keydown', event => {
      let next = agentIndex;
      if (['ArrowRight', 'ArrowDown'].includes(event.key)) next = (next + 1) % scenarios.length;
      else if (['ArrowLeft', 'ArrowUp'].includes(event.key)) next = (next + scenarios.length - 1) % scenarios.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = scenarios.length - 1;
      else return;
      event.preventDefault(); chooseAgent(next, true);
    });
  });
  $('.replay-demo').addEventListener('click', runDemo);
  const agentObserver = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting) && !demoStarted) { runDemo(); agentObserver.disconnect(); }
  }, { threshold: .3 });
  agentObserver.observe($('.agent-console'));


document.addEventListener('motionchange',()=>{motionPaused=document.documentElement.classList.contains('motion-paused');if(motionPaused){stopDemoTimers();finishDemo();}});
}