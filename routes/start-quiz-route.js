var Logger = require('../utils/logger');

module.exports = function(req, res) {
  var quizId = "" + req.params.id,
      sectionIds = getSectionIds(quizId),
      newAnsweredSectionIds = [],
      newAnsweredQuestionIds = [],
      newAnsweredChoiceIds = [],
      newAnsweredSections = [],
      newAnsweredQuestions = [],
      newAnsweredChoices = [],
      owner = req.session.username;//"1"; // TODO get actual user from session

  // create all answered sections
  sectionIds.forEach(function (sectionId) {
    var answeredQuestionIds = [],
        questionIds = getQuestionIds(sectionId);

    // create all answered questions for this section
    questionIds.forEach(function (questionId) {
      var answeredChoiceIds = [],
          choiceIds = getChoiceIds(questionId);

      choiceIds.forEach(function (choiceId) {
        var answeredChoice = createAnsweredChoice(choiceId, owner);
        newAnsweredChoices.push(answeredChoice);
        newAnsweredChoiceIds.push(answeredChoice._id);
        answeredChoiceIds.push(answeredChoice._id);
      });

      var answeredQuestion = createAnsweredQuestion(questionId, owner, answeredChoiceIds);
      newAnsweredQuestions.push(answeredQuestion);
      newAnsweredQuestionIds.push(answeredQuestion._id);
      answeredQuestionIds.push(answeredQuestion._id);
    });

    // create section
    var answeredSection = createAnsweredSection(sectionId, owner, answeredQuestionIds);
    newAnsweredSections.push(answeredSection);
    newAnsweredSectionIds.push(answeredSection._id);
  });


  // create answered quiz
  var answeredQuiz = createAnsweredQuiz(quizId, owner, newAnsweredSectionIds, newAnsweredQuestions);

  var result = {
    answeredQuizzes: [
      answeredQuiz
    ],
    answeredSections: newAnsweredSections,
    answeredQuestions: newAnsweredQuestions,
    answeredChoices: newAnsweredChoices
  };

  Logger.log(JSON.stringify(result), req);
  res.send(201, result);
};

var getSectionIds = function (quizId) {
  Logger.log('getSectionIds', quizId);
	global.db.quizzes.findOne({ _id: quizId }, function (err, doc) {
		if(doc!=null && doc.sections != undefined){
			return doc.sections;
		}else{
			return [];
		}
	});
};

var getQuestionIds = function (sectionId) {
  Logger.log('getQuestionIds', sectionId);
  global.db.sections.findOne({ _id: sectionId }, function (err, doc) {
		if(doc!=null && doc.questions != undefined){
			return doc.questions;
		}else{
			return [];
		}
	});
};

var getChoiceIds = function (questionId) {
  Logger.log('getChoiceIds', questionId);
  global.db.questions.findOne({ _id: questionId }, function (err, doc) {
		if(doc!=null && doc.choices != undefined){
			return doc.choices;
		}else{
			return [];
		}
	});
}

var createAnsweredQuiz = function (quizId, owner, answeredSectionIds) {
	Logger.log('Create answeredQuiz', quizId);
    var body = {
    	    startTime: new Date().getTime(),
    	    quiz: quizId,
    	    answeredSections: answeredSectionIds,
    	    owner: owner
    	  };

    global.db.answeredQuizzes.insert(body, function (err, newDoc) {
    	  return newDoc;
	  }); 
};

var createAnsweredSection = function (sectionId, owner, answeredQuestionIds) {
	Logger.log('Create answeredSection', sectionId);
    var body = {
    	    duration: 0,
    	    section: sectionId,
    	    answeredQuestions: answeredQuestionIds,
    	    owner: owner
    	  };

    global.db.answeredSections.insert(body, function (err, newDoc) {
    	  return newDoc;
	  }); 
};

var createAnsweredQuestion = function (questionId, owner, answeredChoiceIds) {
	Logger.log('Create answeredQuestion', questionId);
    var body = {
    	    question: questionId,
    	    answeredChoices: answeredChoiceIds,
    	    owner: owner
    	  };

    global.db.answeredQuestions.insert(body, function (err, newDoc) {
    	  return newDoc;
	  });
};

var createAnsweredChoice = function (choiceId, owner) {
	Logger.log('Create answeredChoice', choiceId);
    var body = {
    	    choice: choiceId,
    	    isSelected: false,
    	    owner: owner
    	  };

    global.db.answeredChoices.insert(body, function (err, newDoc) {
    	  return newDoc;
	  });
}