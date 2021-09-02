import $ from "jquery";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/styles.css";
import Unit from "./../src/unit.js";
import Hero from "./../src/hero.js";
import Combat from "./../src/combat.js";
import Item from "./../src/item.js";
import Shop from "./../src/shop.js";

function displayStats(hero, enemy) {
  //make html
  const heroHtml = `<h2>${hero.name}</h2>
          <ul>
            <li>Health: ${hero.hp}</li>
            <li>Attack: ${hero.ap}</li>
            <li>Defense: ${hero.dp}</li>
          </ul>`;

  const enemyHtml = `<h2>${enemy.name}</h2>
          <ul>
            <li>Health: ${enemy.hp}</li>
            <li>Attack: ${enemy.ap}</li>
            <li>Defense: ${enemy.dp}</li>
          </ul>`;
  //append it
  $("#hero-stats-display").empty();
  $("#hero-stats-display").append(heroHtml);
  $("#enemy-stats-display").empty();
  $("#enemy-stats-display").append(enemyHtml);
}

function displayIntent(enemy) {
  const intentHtml = `<li class="list-group-item">${enemy.name} will attack for ${enemy.ap}</li>`;
  $("#combat-feed").append(intentHtml);
}

function displayFighting() {
  $("#combat-feed").empty();
  $("#combat-feed").append(`<li><h3>...fighting...</h3></li>`);
}

function displayResults(name, playerDmg, enemyDmg) {
  const resultsHtml = `<li class="list-group-item" >${name} took ${playerDmg} damage!</li><li class="list-group-item">You took ${enemyDmg} damage!</li>`;
  $("#combat-feed").empty();
  $("#combat-feed").append(resultsHtml);
}
function displayRewards(monsterName, level) {
  $("#monster-name-span").text(monsterName);
  const rewardsHtml = `<li class="list-group-item active"><h3>Rewards:</h3></li><li class="list-group-item" >10 gold</li><li class="list-group-item" >You reached Level ${level}</li>`;

  $("#rewards-display").empty();
  $("#rewards-display").append(rewardsHtml);
  $("#combat-screen").hide();
  $("#rewards-screen").show();
}

function displayOptionsResults(message) {
  $("#result-message-span").text(message);
  $("#rewards-screen").hide();
  $("#reward-options-results-screen").show();
}

function displayItems(shop) {
  //object -use Object.keys
  //foreach key, "get" the item and access .id, etc concat a string li

  // Object.keys(shop.inv).map(id => `<li id="${id}" class= "list-group-item">${shop.inv[id].name}: ${shop.inv[id].desc}</li>`).join("");
  //keys doesn't have the items, it has ids
  

  const itemsHtml = Object.keys(shop.inv).map(id => `<li id="${id}" class= "list-group-item">${shop.inv[id].name}: ${shop.inv[id].desc}</li>`).join("");
  
  // `<li id="${shop.inv[1].id}" class= "list-group-item">${shop.inv[1].name}: ${shop.inv[1].desc}</li><li id="2" class= "list-group-item">${shop.inv[2].name}: ${shop.inv[2].desc}</li><li id="3" class= "list-group-item">${shop.inv[3].name}: ${shop.inv[3].desc}</li>`;
  
  $("#item-shop-display").empty();
  $("#item-shop-display").append(itemsHtml);
}



$(document).ready(function () {
  //globals
  let myHero;
  let myEnemy;
  let myCombat;
  let myShop;

  $("#start-form").submit((e) => {
    e.preventDefault();
    const name = $("#name-input").val().trim();
    const heroType = $("input:radio[name=heroType]:checked").val();
    if (heroType === "Warrior") {
      myHero = new Hero(name, 10, 3, 2);
    } else {
      myHero = new Hero(name, 10, 4, 1);
    }
    myShop = new Shop();
    let glassSword = new Item("Glass Sword", 0, 3, -2);
    let healthVial = new Item("Health Vial", 10, 0, 1);
    let aardFang = new Item("Aardvark Fang", -5, 4, 1);
    myShop.addItem(glassSword); 
    myShop.addItem(healthVial); 
    myShop.addItem(aardFang); 
    //start combat
    myEnemy = new Unit("Aardvark", 2, 3, 1);
    myCombat = new Combat(myHero, myEnemy);
    displayStats(myHero, myEnemy);
    displayIntent(myEnemy);
    $("#opening-screen").hide();
    $("#combat-screen").show();
  });

  $("#combat-start-btn").click(() => {
    myEnemy = new Unit("AardvarkBro", 10, 4, 2);
    myCombat = new Combat(myHero, myEnemy);
    displayStats(myHero, myEnemy);
    displayIntent(myEnemy);
    $("#reward-options-results-screen").hide();
    $("#combat-screen").show();
  });

  $("input:checkbox").on("change", function () {
    if ($(this).siblings(":checked").length > 1) {
      this.checked = false;
    }
  });

  $("#options-form").submit((e) => {
    e.preventDefault();
    //get our checked options
    //branch to call the options
    let fightArray = [];
    $("input:checkbox:checked").each(function () {
      if (this.checked) fightArray.push($(this).val());
    });
    if (fightArray.includes("attack")) {
      //call calc fns with attack
      //refactor?
    }

    displayFighting();
    setTimeout(() => {
      // calcPlayerDamage = hero attack() - unit armor  DAMAGE TO THE ENEMY
      // calcEnemyDamge = unit attack() - player armor DAMAGE TO THE PLAYER
      const playerDmg = myCombat.calcPlayerDamage();
      const enemyDmg = myCombat.calcEnemyDamage();
      // unit.reduceHp(calcPlayerDamage)
      // hero.reducehp(calcEnemyDamage());
      myHero.reduceHp(enemyDmg);
      myEnemy.reduceHp(playerDmg);
      if (myEnemy.hp <= 0) {
        myHero.levelUp();
        //item/gold reward updates
        displayRewards(myEnemy.name, myHero.level);
      } else {
        displayStats(myHero, myEnemy);
        // displayOptions()
        displayResults(myEnemy.name, playerDmg, enemyDmg);
        displayIntent(myEnemy);
      }
    }, 1000);

    //next: displayOptions death
  });

  $("#rewards-options-form").submit((e) => {
    e.preventDefault();
    const rewardOption = $("input:radio[name=reward-options]:checked").val();

    let resultMessage = "";
    if (rewardOption === "heal") {
      myHero.reduceHp(-4);
      resultMessage = "healed 4 health";
      displayOptionsResults(resultMessage);
    } else if (rewardOption === "roll") {
      if (Math.random() >= 0.5) {
        //getItem
        resultMessage = "won 10 gold";
        displayOptionsResults(resultMessage);
      } else {
        resultMessage = "lost the roll!";
        displayOptionsResults(resultMessage);
      }
    } else {
      $("#rewards-screen").hide();
      displayItems(myShop);
      $("#shop-screen").show();
    }
  });
  
  $("#item-shop-display").on("click", "li", () => {
    // const id = $(this).id;
    console.log($(this).val())
    console.log()
    // const item = myShop.findItem(id);
    // myHero.addItem(item);
    // myShop.deleteItem(item);
    // displayItems(myShop);
  })
  
});
