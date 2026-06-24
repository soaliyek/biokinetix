
// export default function Header(){
//     const logoSrc = '/biokinetix/assets/biokinetix_big_nbg.png';

//     return `
//     <header>
//         <div class="logo">
//             <img src="${logoSrc}" alt="BioKinetiX logo" srcset="">
//             <h1>BioKinetiX</h1>
//         </div>
//         <nav>
//             <a href="/biokinetix/index.html">Home</a>
//             <a href="/biokinetix/pages/about.html">About</a>
//             <a href="/biokinetix/pages/team.html">Team</a>
//             <a href="/biokinetix/pages/model.html">Model</a>
//             <a href="/biokinetix/pages/simulation.html">Simulation</a>
//             <a href="/biokinetix/pages/analysis.html">Analysis</a>
//         </nav>
//     </header>
//     `;
// }


export default function Header(activePage = '') {
  const links = [
    { href: '/biokinetix/index.html',             label: 'Home'       },
    { href: '/biokinetix/pages/about.html',        label: 'About'      },
    { href: '/biokinetix/pages/model.html',        label: 'Model'      },
    { href: '/biokinetix/pages/simulation.html',   label: 'Simulation' },
    { href: '/biokinetix/pages/analysis.html',     label: 'Analysis'   },
    { href: '/biokinetix/pages/team.html',         label: 'Team'       },
  ];

  const navHTML = links.map(l => {
    const active = l.label.toLowerCase() === activePage.toLowerCase() ? ' active' : '';
    return `<a href="${l.href}" class="${active}">${l.label}</a>`;
  }).join('');

  return `
    <header>
      <a href="/biokinetix/index.html" class="logo">
        <img src="/biokinetix/assets/biokinetix_big_nbg.png" alt="BioKinetiX logo" onerror="this.style.display='none'">
        <h1 class="logo-text">BioKinetiX</h1>
      </a>
      <nav>
        ${navHTML}
      </nav>
    </header>
  `;
}