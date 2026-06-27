BioKinetiX — Two-Compartment Pharmacokinetic Model Website (v4)
================================================================

WHAT'S NEW IN v4:
- NEW 3D drug-journey simulation on the homepage. It auto-plays on
  a loop (no clicking needed), shows a see-through 3D body that
  rotates slowly, with a glowing dose travelling through it and
  changing colour as the liver breaks it down. Built with Three.js.
- ALL writing rewritten in plain, everyday English so it reads
  naturally and follows easily. Scientific terms are kept, but the
  sentences flow better and the hyphen-heavy style is gone.
- Team email is biokinetix.team28@gmail.com

------------------------------------------------------------
HOW TO PUBLISH ON NETLIFY (drag-and-drop, ~60 seconds, free)
------------------------------------------------------------
1. Go to https://app.netlify.com/drop
2. Drag this ENTIRE folder onto the page.
3. Done — you get a live URL instantly.

IMPORTANT: The 3D simulation needs the internet to load its
graphics library (Three.js) from a CDN. This works automatically
on Netlify and any normal web host. It will also fall back to a
short message if a browser cannot run 3D graphics.

------------------------------------------------------------
THE 3D SIMULATION
------------------------------------------------------------
On the homepage, scroll to "Watch a tablet move through the body."
It runs by itself and loops through six steps:
  1. Swallowed   2. Absorbed   3. Carried by blood
  4. Reaches target   5. Liver breaks it down   6. Kidneys clear it
No buttons to press. The body slowly turns so you see it in 3D.

------------------------------------------------------------
HOW TO ENABLE THE CONTACT FORM (one-time setup)
------------------------------------------------------------
1. In your Netlify dashboard, open your site.
2. Click "Forms" in the left sidebar.
3. Click the "contact" form, then "Settings & usage" →
   "Form notifications".
4. Add an "Email notification" → enter biokinetix.team28@gmail.com
5. Every message sent through the form now lands in that inbox.

------------------------------------------------------------
HOW TO ADD TEAM PHOTOS
------------------------------------------------------------
Save each photo as team1.jpg ... team6.jpg in the assets/ folder,
then redeploy. Until then each card shows a placeholder letter.

------------------------------------------------------------
HOW TO EDIT TEAM NAMES / ROLES
------------------------------------------------------------
Open team.html and replace the "Member One" placeholders.

------------------------------------------------------------
FILES
------------------------------------------------------------
  index.html ........ Home (3D simulation + live model + tiles)
  introduction.html . Section 1
  model.html ........ Section 2 (equations + diagram)
  results.html ...... Section 3 (figures from the paper)
  analysis.html ..... Section 4 (sensitivity + changes made)
  programming.html .. Section 5
  further.html ...... Section 6
  team.html ......... 6-member team page
  contact.html ...... Contact form (to biokinetix.team28@gmail.com)
  style.css ......... All styling
  app.js ............ Nav, animations, live model
  adme3d.js ......... 3D drug-journey simulation
  assets/header-bg.mp4 ..... Header background video
  assets/fig*.png ......... Figures from the paper
  BioKinetiX_PK_Model.m .. MATLAB source script
