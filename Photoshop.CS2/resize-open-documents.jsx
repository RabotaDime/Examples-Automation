//   Простой пример сценария для Adobe Photoshop CS2/CS6

//   Документация по функционалу находится:
//     CS2: в папке установки: 
//          \Adobe\Adobe Photoshop CS2\Scripting Guide\
//     CS6: в интернете:
//          "Adobe Photoshop CS6 Scripting Guide"
//          и
//          "Adobe Photoshop CS6 JavaScript Scripting Reference"

//   Особенности сценариев:
//     1. Не допускаются параметры функций по умолчанию. 
//        Такой код выдаст ошибку:
//          function ExecuteForAll (auto_save = true)
//     2. При многих ошибках в JS происходит тихая ошибка и досрочный выход из всего
//        стека вызовов, при условии, когда запущенный код не вложен в блок try/catch.
//        Например:
//          alert("Никто не увидит этого сообщения " + non_existent_variable);



#target photoshop
app.bringToFront();



var GlobalUserName = "Безымянный";
var GlobalDebugMode = true;



function Main ()
{
    //   Спрашиваем имя.
    var user_name = prompt("Как вас зовут?", "Имя", "Вопрос жизни и смерти");
    if (! user_name) user_name = "Инкогнито";
    GlobalUserName = user_name;


    //   Проверяем условия работы сценария. Надо чтобы были открыты файлы, хотя бы один.
    if (app.documents.length <= 0)
    {
        alert(GlobalUserName + ", вы еще не открыли ни одной фотки в Фотошопе. Надо бы открыть.");
        return;
    }


    //   Если есть с чем работать, подтверждаем запуск и выполняем задачи.
    if
    (
        confirm(GlobalUserName + ", вы точно желаете \"уменьшить\" все открытые файлы?")
    )
    {
        ExecuteForAll
        (
            confirm
            (
                "Сохранить все обработанные документы автоматически? Они, как минимум, морально пострадают. " +
                "Будьте уверены, что сделали резервную копию открытых документов. Тогда все будет хорошо."
            )
        );
    }
}



//   Сценарий для обработки одного документа. 
function Job (doc)
{
    SelectActiveDocument(doc);
    ResizeDocument(doc, 0.20);

    //throw new Error("Test Error");
}



function ExecuteForAll (auto_save)
{
    var saved_ruler_units = app.preferences.rulerUnits;
    app.preferences.rulerUnits = Units.PIXELS;

    var error_count = 0;
    var error_records = new Array();

    //   Для каждого открытого документа пытаемся выполнить требуемые операции.
    for (var i = 0; i < app.documents.length; i++)
    {
        var doc = app.documents[i];

        try
        {
            //   Выполняем требуемую работу над документом. 
            Job(doc);

            //   Сохраняем изменения в документе.
            if (auto_save) doc.save();
        }
        catch (e)
        {
            error_count++;

            var rec = {
                doc_name:   doc.name,
                info:       e.description
            };

            error_records.push(rec);
        }
    }

    //   Отображение ошибок. 
    if (error_count == 1)
    {
        var error_record = error_records[0];

        alert
        (
            "Простите, но при редактировании документа \"" + error_record.doc_name + "\" произошла ошибка. " +
            "Мы его пропустим, а там, уважаемый " + GlobalUserName + ", разберитесь.\n\n" +
            "Информация об ошибке такая: " + error_record.info
        );
    }
    else if (error_count > 1)
    {
        var n = 0;
        var info_text = "";

        while (n < Math.min(3, error_records.length))
        {
            info_text += "  " + n + ") " + error_records[n].info + "\n";
            n++;
        }

        if (error_records.length > 3)
        {
            info_text += "  ...\n";
        }
        
        alert
        (
            "Простите, но при редактировании нескольких документов (" + error_records.length + ") произошла ошибка. " +
            "Мы сделали, что смогли, а вы, уважаемый " + GlobalUserName + ", уж разберитесь.\n\n" +
            "Информация об ошибках такая:\n" + info_text
        );
    }

    app.preferences.rulerUnits = saved_ruler_units;
}



function ResizeDocument (doc, scale)
{
    //  Выбираем процент уменьшения размера документа. 
    //  В данном примере это будет 20 процентов.
    var new_width   = (doc.width   * scale);
    var new_height  = (doc.height  * scale);

    //  Ресайзим.
    doc.resizeImage(new_width, new_height);
}



function SelectActiveDocument (doc)
{
    app.activeDocument = doc;
}



function DebugFunc (func)
{
    if (!GlobalDebugMode)
    {
        func();
        return;
    }

    var error = null;

    try
    {
        func();
    }
    catch (e)
    {
        //  
        error = e;
        DebugError(func, e);
    }
    finally
    {
        //  Например, запись в журнал / трассировщик. 
    }
}

function DebugError (func, error)
{
    alert("В программе ошибка: " + error.description);
}



//   Запуск главной функции сценария, чтобы можно было прекратить
//   работу в любой момент без сильных исхищрений. 
DebugFunc(Main);


