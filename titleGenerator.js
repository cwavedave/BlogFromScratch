exports.getTitle = function() {

  const numbers = [
    '5', '10', '12', '15', '30', '100'
  ]

  const blogTitles = [
    'Smart Strategies to',
    'Most Effective Tactics to',
    'Most Popular Ways to',
    'Essential ways to',
    'of the WORST ways to',
    'Creative ways to',
    'Tips for busy people who want to',
    'No Nonsense ways to',
    'FoolProof ways to',
    'Epic formulas to',
    'Handy Tips to',
    'Super Tips to',
  ];

  // const audience = [
  //   'Grandmothers Best Friend',
  //   'Dog',
  //   'Cat',
  //   'The Animal Kingdom',
  //   'Superman',
  //   'Bob Ross',
  //   'Mum',
  //   'Dad',
  //   'Best Friend',
  //   'Genie from the bottle',
  //   'Your Secret Admirer',
  //   'The girl next door',
  //   'Batman',
  //   'The Avengers',
  //   'Harley Quinn',
  //   'Sisters pet gerbil',
  //   'Pet Rabbit'
  // ]

  const businessTerms = [
    'improve your SEO Strategy',
    'build more followers',
    'get Buff in 20 seconds',
    'get Richer',
    'start a pyramid scheme',
    'start world domination',
    'have a practical desk setup',
    'have more money',
    'learn how to get up earlier',
    'steal blog post titles',
    'steal a car',
    'learn Spanish',
    'learn French',
    'improve world peace',
    'talk your friend out of getting a man bun',
    'talk your wife into buying a motorbike with the kids college savings',
    'stop chewing so loud',
    'write catchy blog titles',
    'learn to code by making clickbait blog titles',
    'hint about getting a raise with your boss'
  ]


    let number = numbers[Math.floor(Math.random()*numbers.length)];
    let blogTitle = blogTitles[Math.floor(Math.random()*blogTitles.length)];
    let businessTerm = businessTerms[Math.floor(Math.random()*businessTerms.length)];
    return number + " " + blogTitle + " " + businessTerm
  }
