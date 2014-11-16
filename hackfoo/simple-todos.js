
// Create a MongoDB Collection
PlayersList = new Mongo.Collection('players');
ClassList = new Mongo.Collection('players1');

/*
Class Diagram

Every class is a node.
TestNode {
name
prereq
level
}

CSCI 1100 (CS1)
|
CSCI 1200 (DS) -- CSCI 2200 (FOCS)
|
CSCI 2300 (ALGO) -- CSCI 2500 (COMP ORG)

*/

// Code that only runs on the client (within the web browser)
if(Meteor.isClient){

  // Helper functions execute code within templates
  Template.leaderboard.helpers({
    'player': function(){

      // Get the ID of the current user
      var currentUserId = Meteor.userId();

      // Retrieve data that belongs to the current user
      return PlayersList.find({createdBy: currentUserId});
    },

    'selectedClass': function(){

        // Get the ID of the player being iterated through
        var playerId = this._id;

        // Get the ID of the player that's been clicked
        var selectedPlayer = Session.get('selectedPlayer');

         // Do these IDs match?
        if(playerId == selectedPlayer){

            // Return a CSS class
            return "selected"

        }
    },

    'showSelectedPlayer': function(){

      // Get the ID of the player that's been clicked
      var selectedPlayer = Session.get('selectedPlayer');

      // Retrieve a single document from the collection
      return PlayersList.findOne(selectedPlayer)

    }
  });

  // Events trigger code when certain actions are taken
  Template.leaderboard.events({
      'click .player': function(){

          // Retrieve the unique ID of the player that's been clicked
          var playerId = this._id;

          // Create a session to store the unique ID of the clicked player
          Session.set('selectedPlayer', playerId);

      },
      'click .remove': function(){

        // Get the ID of the player that's been clicked
        var selectedPlayer = Session.get('selectedPlayer');

        // Remove a document from the collection
        PlayersList.remove(selectedPlayer);

      }
  });

  Template.addPlayerForm.events({
    'submit form': function(event){

        // Prevent the browser from applying default behaviour to the form
        event.preventDefault();

        // Get the value from the "playerName" text field
        firstNameVar = event.target.firstName.value;
	lastNameVar = event.target.lastName.value;
     	majorVar = event.target.major.value;
	classYearVar = event.target.classYear.value;

        // Get the ID of the current user
        var currentUserId = Meteor.userId();

        // Insert the new player into the collection
        PlayersList.insert({
          firstName: firstNameVar,
          lastName: lastNameVar,
          major: majorVar,
	  classYear: classYearVar,
          createdBy: currentUserId
        });
    }
  });

//
//show the class tree
//
 Template.showClassTree.helpers({
    'player': function(){

      // Get the ID of the current user
      var currentUserId = Meteor.userId();

      // Retrieve data that belongs to the current user
      return ClassList.find({createdBy: currentUserId});

    },
    'selectedClass': function(){

        // Get the ID of the player being iterated through
        var playerId = this._id;

        // Get the ID of the player that's been clicked
        var selectedPlayer = Session.get('selectedPlayer');

         // Do these IDs match?
        if(playerId == selectedPlayer){

            // Return a CSS class
            return "selected"

        }

    },
    'showSelectedPlayer': function(){

      // Get the ID of the player that's been clicked
      var selectedPlayer = Session.get('selectedPlayer');

      // Retrieve a single document from the collection
      return ClassList.findOne(selectedPlayer)
z
    }
  });

  //Display the class tree based off of the data
  //Events trigger code when certain actions are taken
  Template.showClassTree.events({
      'click .player': function(){

          // Retrieve the unique ID of the player that's been clicked
          var playerId = this._id;

          // Create a session to store the unique ID of the clicked player
          Session.set('selectedPlayer', playerId);

      },
      'click .remove': function(){

        // Get the ID of the player that's been clicked
        var selectedPlayer = Session.get('selectedPlayer');

        // Remove a document from the collection
        ClassList.remove(selectedPlayer);
      }
  });


//the class tree is actually a table. each semester is a row of classes.
  Template.showClassTree.getClassOptions = function() {

	var options = ClassList.find({}, {sort: {score: 1}});
	var optionsHTML = "";
	
	var numCourses = 0; //number of classes per semester (assume max limit is 4)
	var numSem = 1; //number of semesters processed
	var prevLevel = 1;
	optionsHTML += "<TABLE BORDER='0' cellpadding='10' CELLSPACING='10' width='8000'>";

	//First semester
	optionsHTML += "<tr><td width='100'><div style='box-shadow: 0 0px 3px black;width: 8000;height: 75; padding:10px'><div style='box-shadow: 0 0px 0px white;display: inline-block;width: 200px;height: 100px;text-align: left;vertical-align: middle;'><br/><br/>";
	optionsHTML += "<b>Fall " + (2013+prevLevel-1) + "</b></div>";

	//Iterate through all the classes in the schedule
	options.forEach(function(product)
	{
		//optionsHTML += "<TD width='200' HEIGHT='75' ALIGN='left' >"
		var newOption = " ";
		if (numCourses >= 4) //print new line if class needs prereq or there are too many courses in one semester
		{
			//reset counter for next semester
			numSem++;
			numCourses = 0;

			//move to the next row
			optionsHTML += "</div></td></tr>";
		
			//indicate the next semester's date (ex. spring 2014)
			optionsHTML += "<tr><td width='100'><div style='box-shadow: 0 0px 3px black;width: 8000;height: 75; padding:10px'><div style='box-shadow: 0 0px 0px white;display: inline-block;width: 200px;height: 100px;text-align: left;vertical-align: middle;'><br/><br/>";
			if (numSem % 2 == 1)
				optionsHTML += "<b>Fall " + (2013+(numSem-1)/2) + "</b></div>";
			else
				optionsHTML += "<b>Spring " + (2013+numSem/2) + "</b></div>";
		}

		//draw the class block
		optionsHTML += "<div style='box-shadow: 0 0px 3px black;display: inline-block;width: 200px;height: 100px;text-align: center;vertical-align: middle; '>" + "<br/><br/>" + product.className + "</div>";

		//draw a dummy in between the class blacks
		optionsHTML += "<div style='box-shadow: 0 0px 0px white;display: inline-block;width:20px;height:100px;text-align: center;vertical-align: middle; '></div>";

		numCourses++;

	});   

	optionsHTML += "</tr></TABLE>";
	return optionsHTML;
  }


  //Add Classes to the tree
  Template.addClassForm.events({
    'submit form': function(event){

        // Prevent the browser from applying default behaviour to the form
        event.preventDefault();

        // Get the value from the "playerName" text field
        classNameVar = event.target.className.value;
	prereqVar = event.target.prereq.value;

	//If there is no prerequisite, this class must be at the root of the tree.
	//otherwise it must be a level below the prerequisite
        if (prereqVar == "")
		levelVar = 1;
	else
	{
		levelVarCursor = ClassList.find({className: prereqVar});
		levelVar = 1;
		levelVarCursor.forEach(function(classItem) {
    			levelVar = classItem.level + 1;
		});
	}

	//major req(1), major elective(2), free elective(3)
	var prefix = classNameVar.substring(0, 4);
	if (prefix == "CSCI")
		classTypeVar = 1;
	else if (prefix == "PHYS" || prefix == "MATH" || prefix == "BIOL" || prefix == "CHEM")
		classTypeVar = 2;
	else 
		classTypeVar = 3;
	
	var scoreVar = classTypeVar + 4 * levelVar;

        // Get the ID of the current user
        var currentUserId = Meteor.userId();

        // Insert the new player into the collection
        ClassList.insert({
          className: classNameVar,
          prereq: prereqVar,
	  level: levelVar,
	  score: scoreVar, //lower means take this class first
	  createdBy: currentUserId
        });
    }
  });

   Template.deleteClassForm.events({
    'submit form': function(event){

        // Prevent the browser from applying default behaviour to the form
        event.preventDefault();

        // Get the value from the "playerName" text field
        classNameVar = event.target.className.value;

	classCursor = ClassList.find({className: classNameVar});
	classCursor.forEach(function(classItem) {
			var classId = classItem._id;
    			ClassList.remove(classId);
    	});
      }
   });
}

// Code that only runs on the server (where the application is hosted)
if(Meteor.isServer){
  	Meteor.startup(function() {
	       return Meteor.methods({
		removeAllPosts: function() {
		return ClassLists.remove({});
		}
	    });
  	});
}
