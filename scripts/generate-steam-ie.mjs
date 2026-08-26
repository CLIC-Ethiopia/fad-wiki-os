import fs from 'node:fs/promises';
import path from 'node:path';

const VAULT_PATH = String.raw`C:\Users\Frehun\Documents\Fad.Lab\IdeaVerse`;

const files = {
  "Science": [
    {
      name: "Physics.md",
      tags: ["#Science", "#STEAM-IE", "#Physics"],
      categories: ["Science"],
      content: "Physics is the natural science that studies matter, its fundamental constituents, its motion and behavior through space and time. It connects deeply with [[Mathematics]] and [[Engineering]].\n\nRelated: [[Cognitive-Science]], [[Robotics]]"
    },
    {
      name: "Biology.md",
      tags: ["#Science", "#STEAM-IE", "#Biology"],
      categories: ["Science"],
      content: "Biology is the scientific study of life. In a STEAM-IE context, it interfaces heavily with [[Technology]] through [[Bioinformatics]] and [[Engineering]] through synthetic biology.\n\nSee also: [[Artificial-Intelligence]], [[Systems-Engineering]]"
    },
    {
      name: "Cognitive-Science.md",
      tags: ["#Science", "#STEAM-IE", "#CognitiveScience"],
      categories: ["Science"],
      content: "Cognitive science is the interdisciplinary, scientific study of the mind and its processes. It draws from [[Biology]], [[Artificial-Intelligence]], and psychology.\n\nSee also: [[EdTech-Startup]], [[Design-Thinking]]"
    }
  ],
  "Technology": [
    {
      name: "Artificial-Intelligence.md",
      tags: ["#Technology", "#STEAM-IE", "#AI"],
      categories: ["Technology"],
      content: "AI is intelligence demonstrated by machines, as opposed to natural intelligence displayed by animals including humans. It relies heavily on [[Data-Science]] and [[Applied-Statistics]].\n\nIt is central to modern [[Innovation-Strategy]] and [[Venture-Capital]] funding."
    },
    {
      name: "Web-Development.md",
      tags: ["#Technology", "#STEAM-IE", "#WebDev"],
      categories: ["Technology"],
      content: "Web development is the work involved in developing a website for the Internet. It incorporates elements of [[UI-UX-Design]] from the [[Arts]] and is a core component of many an [[EdTech-Startup]]."
    },
    {
      name: "Blockchain.md",
      tags: ["#Technology", "#STEAM-IE", "#Blockchain"],
      categories: ["Technology"],
      content: "A blockchain is a distributed ledger with growing lists of records (blocks) that are securely linked together via cryptographic hashes. See [[Cryptography]].\n\nIt forms the backbone of [[FinTech-Innovations]]."
    }
  ],
  "Engineering": [
    {
      name: "Robotics.md",
      tags: ["#Engineering", "#STEAM-IE", "#Robotics"],
      categories: ["Engineering"],
      content: "Robotics involves the design, construction, operation, and use of robots. The goal of robotics is to design machines that can help and assist humans. It integrates [[Physics]], [[Mathematics]], and [[Artificial-Intelligence]]."
    },
    {
      name: "Systems-Engineering.md",
      tags: ["#Engineering", "#STEAM-IE", "#Systems"],
      categories: ["Engineering"],
      content: "Systems engineering is an interdisciplinary field of engineering and engineering management that focuses on how to design, integrate, and manage complex systems over their life cycles.\n\nLinks with [[Product-Management]]."
    },
    {
      name: "Hardware-Design.md",
      tags: ["#Engineering", "#STEAM-IE", "#Hardware"],
      categories: ["Engineering"],
      content: "Hardware design encompasses all the steps involved in developing a physical product, from initial concept to the final manufactured item. Relies on [[Physics]] and [[Design-Thinking]]."
    }
  ],
  "Arts": [
    {
      name: "Design-Thinking.md",
      tags: ["#Arts", "#STEAM-IE", "#DesignThinking"],
      categories: ["Arts"],
      content: "Design thinking is a non-linear, iterative process that teams use to understand users, challenge assumptions, redefine problems and create innovative solutions to prototype and test.\n\nIt is deeply integrated into [[Innovation-Strategy]] and [[Product-Management]]."
    },
    {
      name: "Digital-Media.md",
      tags: ["#Arts", "#STEAM-IE", "#DigitalMedia"],
      categories: ["Arts"],
      content: "Digital media is any media that are encoded in machine-readable formats. It is the intersection of traditional media and [[Web-Development]].\n\nSee [[UI-UX-Design]] and [[Creative-Coding]]."
    },
    {
      name: "UI-UX-Design.md",
      tags: ["#Arts", "#STEAM-IE", "#UX"],
      categories: ["Arts"],
      content: "User interface (UI) and user experience (UX) design involve creating intuitive and aesthetically pleasing digital products. It links [[Cognitive-Science]] and [[Web-Development]]."
    }
  ],
  "Mathematics": [
    {
      name: "Data-Science.md",
      tags: ["#Mathematics", "#STEAM-IE", "#DataScience"],
      categories: ["Mathematics"],
      content: "Data science is an interdisciplinary field that uses scientific methods, processes, algorithms and systems to extract knowledge and insights from noisy, structured and unstructured data.\n\nIt powers [[Artificial-Intelligence]] and [[Bioinformatics]]."
    },
    {
      name: "Cryptography.md",
      tags: ["#Mathematics", "#STEAM-IE", "#Cryptography"],
      categories: ["Mathematics"],
      content: "Cryptography is the practice and study of techniques for secure communication in the presence of adversarial behavior. It relies on deep [[Applied-Statistics]] and is the foundation of [[Blockchain]]."
    },
    {
      name: "Applied-Statistics.md",
      tags: ["#Mathematics", "#STEAM-IE", "#Statistics"],
      categories: ["Mathematics"],
      content: "Applied statistics involves the application of statistics to real-world problems. It is vital for [[Venture-Capital]] risk assessment and [[Data-Science]]."
    }
  ],
  "Innovation": [
    {
      name: "Innovation-Strategy.md",
      tags: ["#Innovation", "#STEAM-IE", "#Strategy"],
      categories: ["Innovation"],
      content: "Innovation strategy is a plan made by an organization to encourage advancements in technology or services, usually by investing in research and development activities. See [[Design-Thinking]]."
    },
    {
      name: "Disruptive-Innovation.md",
      tags: ["#Innovation", "#STEAM-IE", "#Disruption"],
      categories: ["Innovation"],
      content: "Disruptive innovation is an innovation that creates a new market and value network and eventually disrupts an existing market and value network, displacing established market-leading firms, products, and alliances. Closely linked to [[Lean-Startup]]."
    }
  ],
  "Entrepreneurship": [
    {
      name: "Lean-Startup.md",
      tags: ["#Entrepreneurship", "#STEAM-IE", "#Lean"],
      categories: ["Entrepreneurship"],
      content: "The lean startup is a methodology for developing businesses and products that aims to shorten product development cycles and rapidly discover if a proposed business model is viable. See [[Product-Management]]."
    },
    {
      name: "Venture-Capital.md",
      tags: ["#Entrepreneurship", "#STEAM-IE", "#VC"],
      categories: ["Entrepreneurship"],
      content: "Venture capital (VC) is a form of private equity financing that is provided by venture capital firms or funds to startups, early-stage, and emerging companies that have been deemed to have high growth potential. Funds [[FinTech-Innovations]] and [[EdTech-Startup]]."
    },
    {
      name: "Product-Management.md",
      tags: ["#Entrepreneurship", "#STEAM-IE", "#PM"],
      categories: ["Entrepreneurship"],
      content: "Product management is an organizational function within a company dealing with new product development, business justification, planning, verification, forecasting, pricing, product launch, and marketing of a product or products at all stages of the product lifecycle.\n\nConnects [[Systems-Engineering]], [[Design-Thinking]], and [[Web-Development]]."
    }
  ],
  "Interdisciplinary": [
    {
      name: "Creative-Coding.md",
      tags: ["#Interdisciplinary", "#STEAM-IE", "#CreativeCoding"],
      categories: ["Arts", "Technology"],
      content: "Creative coding is a type of computer programming in which the goal is to create something expressive instead of something functional. It is the marriage of [[Web-Development]] and [[Digital-Media]]."
    },
    {
      name: "Bioinformatics.md",
      tags: ["#Interdisciplinary", "#STEAM-IE", "#Bioinformatics"],
      categories: ["Science", "Technology", "Mathematics"],
      content: "Bioinformatics is an interdisciplinary field that develops methods and software tools for understanding biological data, in particular when the data sets are large and complex. It links [[Biology]], [[Data-Science]], and [[Applied-Statistics]]."
    },
    {
      name: "EdTech-Startup.md",
      tags: ["#Interdisciplinary", "#STEAM-IE", "#EdTech"],
      categories: ["Entrepreneurship", "Technology"],
      content: "Educational technology (EdTech) is the combined use of computer hardware, software, and educational theory and practice to facilitate learning. It requires [[Cognitive-Science]], [[Web-Development]], and [[Lean-Startup]] principles."
    },
    {
      name: "FinTech-Innovations.md",
      tags: ["#Interdisciplinary", "#STEAM-IE", "#FinTech"],
      categories: ["Innovation", "Technology", "Mathematics"],
      content: "Financial technology (FinTech) is the technology and innovation that aims to compete with traditional financial methods in the delivery of financial services. Built heavily on [[Blockchain]] and [[Cryptography]]."
    }
  ]
};

async function main() {
  console.log(`Creating STEAM-IE Vault at: ${VAULT_PATH}`);
  
  try {
    await fs.mkdir(VAULT_PATH, { recursive: true });
    console.log('Vault root created.');

    for (const [folderName, notes] of Object.entries(files)) {
      const folderPath = path.join(VAULT_PATH, folderName);
      await fs.mkdir(folderPath, { recursive: true });
      
      for (const note of notes) {
        const filePath = path.join(folderPath, note.name);
        
        const dateStr = new Date().toISOString().split('T')[0];
        const title = note.name.replace('.md', '').replace(/-/g, ' ');
        const tagsStr = note.tags.map(t => `  - "${t.replace('#', '')}"`).join('\n');
        const categoriesStr = note.categories.map(c => `  - "${c}"`).join('\n');
        
        const markdown = `---
title: "${title}"
date: "${dateStr}"
author: Campus Admin
tags:
${tagsStr}
categories:
${categoriesStr}
---

# ${title}

${note.tags.join(' ')}

${note.content}
`;

        await fs.writeFile(filePath, markdown, 'utf8');
        console.log(`Created: ${folderName}/${note.name}`);
      }
    }
    
    console.log('STEAM-IE Vault generation complete!');
  } catch (err) {
    console.error('Error generating vault:', err);
  }
}

main();
