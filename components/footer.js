
export default function Footer() {
  const year = new Date().getFullYear();
  return `
    <footer>
      <div>
        <p class="footer-brand">BioKinetiX</p>
        <p>Differential Equations Project @ Ashesi University</p>
      </div>
      <div class="footer-links">
        <a href="/biokinetix/pages/about.html">About</a>
        <a href="/biokinetix/pages/model.html">Model</a>
        <a href="/biokinetix/pages/simulation.html">Simulation</a>
        <a href="/biokinetix/pages/analysis.html">Analysis</a>
        <a href="/biokinetix/pages/team.html">Team</a>
      </div>
      <p>&copy; ${year} BioKinetiX Group</p>
    </footer>
  `;
}