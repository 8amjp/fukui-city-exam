$(function() {

    $.ajax(
        "./exam.xml",
        {
            type: "GET",
            cache: false,
            dataType:"xml"
        }
    )
    .done(function(xml){
        initQuestion(xml);
    })
    .fail()
    .always();
    
    function initQuestion(xml) {
        var allquestions = $(xml).find('question');
        var questions = [];
        var numOfQuestion = allquestions.length < 10 ? allquestions.length : 10;
        while(questions.length < numOfQuestion) {
            questions.push( allquestions.splice( Math.random() * allquestions.length, 1) );
        }

        var container = ($("<div/>"));
        var itemtemplate = ($("<div/>").addClass("question-container").addClass("unanswered"))
                                                 .append($("<div/>").addClass("question-title")
                                                     .append($("<span/>").addClass("title"))
                                                     .append($("<span/>").addClass("mark"))
                                                 )
                                                 .append($("<div/>").addClass("question-contents").hide()
                                                     .append($("<div/>").addClass("question-text"))
                                                     .append($("<div/>").addClass("question-feedback").hide())
                                                 );
        var answertemplate = ($("<button/>").addClass("question-answer"));
        $(questions).each(function(i) {
            var item = itemtemplate.clone();
            item.attr( "data-defaultgrade", $(this).find("defaultgrade").text() );
            item.find(".question-title").find(".title").text( "Q" + (i + 1) );
            item.find(".question-text").text( $(this).find("questiontext").find("text").text() );
            item.find(".question-feedback").text( "解説: " + $(this).find("correctfeedback").find("text").text() );
            var answerscontainer = ($("<div/>").addClass("question-options"));
            var answers = $(this).find('answer');
            while(answers.length > 0) {
                var answer = answers.splice( Math.random() * answers.length, 1 );
                var answeritem = answertemplate.clone();
                answeritem.text( $(answer).find("text").text() ).attr( "data-fraction", $(answer).attr("fraction") );
                answerscontainer.append( answeritem );
            }
            item.find(".question-text").after(answerscontainer);
            container.append(item);
        });

        var header = 
            ($("<div/>").attr("id", "questions-header")
             .append($("<button/>").attr("id", "questions-play").text("開始"))
             .append($("<button/>").attr("id", "questions-mark").text("採点する").hide())
             .append($("<div/>").attr("id", "questions-result").hide()
                 .append($("<span/>").attr("id", "questions-marks"))
                 .append($("<span/>").addClass("per").text("/"))
                 .append($("<span/>").attr("id", "questions-maximumgrade").text(numOfQuestion))
             )
         );

        $("#dashboard").append(header).append(container);

        startQuestion();
    }

    function startQuestion() {
        $("#questions-play").on("click", function() {
            $(this).off().fadeOut('fast', function() {
                $(".question-container").first().removeClass("unanswered").addClass("current");
                nextQuestion();
            })
        });
    }

    function nextQuestion() {
        var currentQuestion = $(".current");
        currentQuestion.find(".question-contents").slideDown('fast', function() {
            currentQuestion.find(".question-options").find("button").on("click", function() {
                selectAnswer($(this), currentQuestion);
            })
        });
    }

    function selectAnswer(selected, q) {
        selected.addClass("selected")
                        .siblings().not(this).addClass("unselected")
                        .siblings().off();
        q.find(".question-contents").slideUp('fast', function() {
            q.removeClass("current").addClass("answered");
            if (q.next().size() > 0) {
                q.next().removeClass("unanswered").addClass("current");
                nextQuestion();
            } else {
                endQuestion();
            }
        });
    }

    function endQuestion() {
        $('html,body').animate({ scrollTop: 0 }, 'fast');
        $("#questions-mark").show().on("click", function() {
            $(this).off().fadeOut('fast', function() {
                markQuestion();
            })
        });
    }

    function markQuestion() {
        $(".question-feedback").show(); // 解説文を表示します
        $("button[data-fraction=100]").addClass("correct"); // 正解の選択肢を強調表示します
        $(".selected").not(".correct").addClass("incorrect"); // 不正解の選択肢を強調表示します
        var marks = 0;
        $(".question-container").each(function() {
            var points = ( parseInt($(this).data("defaultgrade")) * parseInt($(this).find(".selected").data("fraction")) / 100 );
            $(this).addClass( (points > 0 ? "correct" : "incorrect") );
            marks += points;
        });
        $("#questions-marks").text(marks);
        $("#questions-result").show();
        $(".question-contents").each(function() {
            $(this).slideDown('slow', function() {});
        });
    }

});
