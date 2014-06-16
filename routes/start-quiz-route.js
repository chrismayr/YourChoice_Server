var RSVP = require('rsvp');
var Logger = require('../utils/logger');
var prettyjson = require('prettyjson');
var _ = require('lodash');

module.exports = function(req, res) {
  var quizId = "" + req.params.id,
      sessionId = req.body.sessionId;
      // just for debugging purposes
      refCount = {
        sections: 0,
        questions: 0,
        choices: 0,
        answeredQuizzes: 0,
        answeredSections: 0,
        answeredQuestions: 0,
        answeredChoices: 0
      },
      // contains all the data
      tree = {
        quiz: null,
        sections: [],
        questions: [],
        choices: [],
        answeredQuiz: null,
        answeredSections: [],
        answeredQuestions: [],
        answeredChoices: [],
      },
      owner = req.session.userId;

  // get quiz
  getQuiz(quizId, tree, refCount).then(function (quiz) {
    var sectionIds = quiz.sections;

    // get all sections
    var promises = sectionIds.map(function(sectionId) {
      return getSection(sectionId, quizId, tree, refCount);
    });

    return RSVP.all(promises);
  }).then(function (sections) {
    var questionIds = [];

    // get all question ids
    sections.forEach(function (section) {
      section.questions.forEach(function (questionId) {
        questionIds.push(questionId);
        tree.questions.push({
          id: questionId,
          parent: section._id,
          data: null
        });
      });
    });

    // get all questions
    var promises = questionIds.map(function (questionId) {
      return getQuestion(questionId, tree, refCount);
    });

    return RSVP.all(promises);
  }).then(function (questions) {
    var choiceIds = [];

    // get all choice ids
    questions.forEach(function (question) {
      question.choices.forEach(function (choiceId) {
        choiceIds.push(choiceId);
        tree.choices.push({
          id: choiceId,
          parent: question._id,
          data: null
        });
      });
    });

    // get all choices
    var promises = choiceIds.map(function (choiceId) {
      return getChoice(choiceId, tree, refCount);
    });

    return RSVP.all(promises);
  }).then(function (choices) {
    // create all answered choices
    var promises = tree.choices.map(function (choice) {
      return createAnsweredChoice(choice, owner, tree, refCount);
    });

    return RSVP.all(promises);
  }).then(function (answeredChoices) {
    // create all answered questions
    var promises = tree.questions.map(function (question) {
      return createAnsweredQuestion(question, owner, tree, refCount);
    });

    return RSVP.all(promises);
  }).then(function (answeredQuestions) {
    // create all answered sections
    var promises = tree.sections.map(function (section) {
      return createAnsweredSection(section, owner, tree, refCount);
    });

    return RSVP.all(promises);
  }).then(function (answeredSections) {
    // create answered quiz
    return createAnsweredQuiz(tree.quiz, sessionId, owner, tree, refCount);
  }).then(function (answeredQuiz) {
    // create result
    var result = createResult(tree, refCount);

    console.log("CREATED THIS INSANELY DIFFUCULT RESULT. BOOM!");
    res.send(201, result);
  }).catch(function(error) {
    console.log(prettyjson.render(refCount, {dashColor: 'red', indentation: '8'}));

    console.log('CATCH THIS!!');
    res.send(500, { message: 'Error constructing the data structures.'});
  });
};


var createResult = function (tree, refCount) {
  Logger.log('create result');

  var answeredSections = [],
      answeredQuestions = [],
      answeredChoices = [];

  // extract data from tree
  tree.answeredSections.forEach(function(answeredSection) {
    answeredSections.push(answeredSection.data);
  })
  tree.answeredQuestions.forEach(function(answeredQuestion) {
    answeredQuestions.push(answeredQuestion.data);
  })
  tree.answeredChoices.forEach(function(answeredChoice) {
    answeredChoices.push(answeredChoice.data);
  })

  // create result
  var result = {
    answeredQuizzes: [
      tree.answeredQuiz.data
    ],
    answeredSections: answeredSections,
    answeredQuestions: answeredQuestions,
    answeredChoices: answeredChoices
  };

  return result;
}

var getQuiz = function (quizId, tree, refCount) {
  Logger.log('get quiz: ' + quizId);

  var promise = new RSVP.Promise(function(resolve, reject) {
    db.quizzes.findOne({ _id: quizId }, function (err, quiz) {
      if(quiz != null) {
        tree.quiz = quiz;
        refCount.quizzes++;

        resolve(quiz);
      } else{
        reject(err);
      }
    });
  });

  return promise;
};


var getSection = function (sectionId, quizId, tree, refCount) {
  Logger.log('get section: ' + sectionId);

  var promise = new RSVP.Promise(function (resolve, reject) {
    global.db.sections.findOne({ _id: sectionId }, function (err, section) {
      if (section != undefined) {
        tree.sections.push({
          id: sectionId,
          parent: quizId,
          data: section
        });
        refCount.sections++;

        resolve(section);
      } else {
        reject(err);
      }
    });
  });

  return promise;
};

var getQuestion = function (questionId, tree, refCount) {
  Logger.log('get question: ' + questionId);

  var promise = new RSVP.Promise(function (resolve, reject) {
    global.db.questions.findOne({ _id: questionId }, function (err, question) {
      if (question != undefined) {
        var q = _.find(tree.questions, {'id': questionId});
        q.data = question;
        refCount.questions++;

        resolve(question);
      } else{
        reject(err);
      }
    });
  });

  return promise;
};

var getChoice = function (choiceId, tree, refCount) {
  Logger.log('get choice: ' + choiceId);

  var promise = new RSVP.Promise(function (resolve, reject) {
    global.db.choices.findOne({ _id: choiceId }, function (err, choice) {
      if (choice != undefined) {
        var c = _.find(tree.choices, {'id': choiceId});
        c.data = choice;
        refCount.choices++;

        resolve(choice);
      } else{
        reject(err);
      }
    });
  });

  return promise;
}

var createAnsweredQuiz = function (quiz, sessionId, owner, tree, refCount) {
  Logger.log('create answered quiz');

  var promise = new RSVP.Promise(function(resolve, reject) {
    var answeredSectionIds = answeredSectionIdsForQuiz(quiz, tree);

    var body = {
      startTime: new Date().getTime(),
      quiz: quiz._id,
      answeredSections: answeredSectionIds,
      owner: owner,
      session: sessionId
    };

    global.db.answeredQuizzes.insert(body, function (err, answeredQuiz) {
      if (answeredQuiz != undefined) {
        tree.answeredQuiz = {
          id: answeredQuiz._id,
          quiz: quiz,
          data: answeredQuiz
        };
        refCount.answeredQuizzes++;

        resolve(answeredQuiz);
      } else {
        reject(err);
      }
    });
  });

  return promise;
};

var answeredSectionIdsForQuiz = function (quiz, tree) {
  var sectionIds = quiz.sections,
      answeredSectionIds = [];

  sectionIds.forEach(function(sectionId) {
    var answeredSection = _.find(tree.answeredSections, { section: { id: sectionId }} );
    answeredSectionIds.push(answeredSection.data._id);
  });

  return answeredSectionIds;
};

var createAnsweredSection = function (section, owner, tree, refCount) {
  Logger.log('Create answeredSection');

  var promise = new RSVP.Promise(function (resolve, reject) {
    var answeredQuestionIds = answeredQuestionIdsForSection(section, tree);

    var body = {
      duration: 0,
      section: section.data._id,
      answeredQuestions: answeredQuestionIds,
      owner: owner
    };

    global.db.answeredSections.insert(body, function (err, answeredSection) {
      if (answeredSection != undefined) {
        tree.answeredSections.push({
          id: answeredSection._id,
          section: section,
          data: answeredSection
        });
        refCount.answeredSections++;

        resolve(answeredSection);
      } else {
        reject(err);
      }
    });
  });

  return promise;
};

var answeredQuestionIdsForSection = function (section, tree) {
  var questionIds = section.data.questions,
      answeredQuestionIds = [];

  questionIds.forEach(function(questionId) {
    var answeredQuestion = _.find(tree.answeredQuestions, { question: { id: questionId }} );
    answeredQuestionIds.push(answeredQuestion.data._id);
  });

  return answeredQuestionIds;
};


var createAnsweredQuestion = function (question, owner, tree, refCount) {
  Logger.log('Create answeredQuestion');

  var promise = new RSVP.Promise(function (resolve, reject) {
    var answeredChoiceIds = answeredChoiceIdsForQuestion(question, tree);

    var body = {
      question: question.data._id,
      answeredChoices: answeredChoiceIds,
      owner: owner
    };

    global.db.answeredQuestions.insert(body, function (err, answeredQuestion) {
      if (answeredQuestion != undefined) {
        tree.answeredQuestions.push({
          id: answeredQuestion._id,
          question: question,
          data: answeredQuestion
        });
        refCount.answeredQuestions++;

        resolve(answeredQuestion);
      } else {
        reject(err);
      }
    });
  });

  return promise;
};

var answeredChoiceIdsForQuestion = function (question, tree) {
  var choiceIds = question.data.choices,
      answeredChoiceIds = [];

  choiceIds.forEach(function(choiceId) {
    var answeredChoice = _.find(tree.answeredChoices, { choice: { id: choiceId }} );
    answeredChoiceIds.push(answeredChoice.data._id);
  });

  return answeredChoiceIds;
};

var createAnsweredChoice = function (choice, owner, tree, refCount) {
  Logger.log('Create answeredChoice for choice: ' + choice.id);

  var promise = new RSVP.Promise(function (resolve, reject) {
    var body = {
      choice: choice.data._id,
      isSelected: false,
      owner: owner
    };

    global.db.answeredChoices.insert(body, function (err, answeredChoice) {
      if (answeredChoice != undefined) {
        tree.answeredChoices.push({
          id: answeredChoice._id,
          choice: choice,
          data: answeredChoice
        });
        refCount.answeredChoices++;

        resolve(answeredChoice);
      } else {
        reject(err);
      }
    });
  });

  return promise;
}